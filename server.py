#!/usr/bin/env python

import asyncio
import websockets
import json

users = []
server_status = {
	"waiting": {}
}

def msgobj(type, value=None):
	if value == None:
		return json.dumps({"type": type})
	else:
		return json.dumps({"type": type, "value": value})

def status_event():
	value = []
	for id, userDiff in server_status["waiting"].items():
		value.append({
			"id": id,
			"diff": userDiff["diff"]
		})
	return msgobj("users", value)

async def notify_status():
	ready_users = [user for user in users if "ws" in user and user["action"] == "ready"]
	if ready_users:
		sent_msg = status_event()
		await asyncio.wait([user["ws"].send(sent_msg) for user in ready_users])

async def connection(ws, path):
	# User connected
	user = {
		"ws": ws,
		"action": "ready"
	}
	users.append(user)
	try:
		# Notify user about other users
		await ws.send(status_event())
		while True:
			try:
				message = await asyncio.wait_for(ws.recv(), timeout=5)
			except asyncio.TimeoutError:
				# Keep user connected
				pong_waiter = await ws.ping()
				try:
					await asyncio.wait_for(pong_waiter, timeout=5)
				except asyncio.TimeoutError:
					# Disconnect
					break
			else:
				# Message received
				try:
					data = json.loads(message)
				except json.decoder.JSONDecodeError:
					data = {}
				action = user["action"]
				type = data["type"] if "type" in data else None
				value = data["value"] if "value" in data else None
				if action == "ready":
					# Not playing or waiting
					if type == "join":
						waiting = server_status["waiting"]
						id = value["id"] if "id" in value else None
						diff = value["diff"] if "diff" in value else None
						if not id or not diff:
							continue
						if id not in waiting:
							# Wait for another user
							user["action"] = "waiting"
							user["gameid"] = id
							waiting[id] = {
								"user": user,
								"diff": diff
							}
							await ws.send(msgobj("waiting"))
						else:
							# Join the other user and start game
							user["other_user"] = waiting[id]["user"]
							waiting_diff = waiting[id]["diff"]
							del waiting[id]
							if "ws" in user["other_user"]:
								user["action"] = "loading"
								user["other_user"]["action"] = "loading"
								user["other_user"]["other_user"] = user
								await asyncio.wait([
									ws.send(msgobj("gameload", waiting_diff)),
									user["other_user"]["ws"].send(msgobj("gameload", diff))
								])
							else:
								# Wait for another user
								user["action"] = "waiting"
								user["gameid"] = id
								waiting[id] = {
									"user": user,
									"diff": diff
								}
								await ws.send(msgobj("waiting"))
						# Update others on waiting players
						await notify_status()
				elif action == "waiting" or action == "loading" or action == "loaded":
					# Waiting for another user
					if type == "leave":
						# Stop waiting
						del server_status["waiting"][user["gameid"]]
						del user["gameid"]
						user["action"] = "ready"
						await asyncio.wait([
							ws.send(msgobj("left")),
							notify_status()
						])
					if action == "loading":
						if type == "gamestart":
							user["action"] = "loaded"
							if user["other_user"]["action"] == "loaded":
								user["action"] = "playing"
								user["other_user"]["action"] = "playing"
								sent_msg = msgobj("gamestart")
								await asyncio.wait([
									ws.send(sent_msg),
									user["other_user"]["ws"].send(sent_msg)
								])
				elif action == "playing":
					# Playing with another user
					if "other_user" in user and "ws" in user["other_user"]:
						if type == "note":
							await user["other_user"]["ws"].send(msgobj("note", value))
						if type == "gameend":
							# User wants to disconnect
							user["action"] = "ready"
							user["other_user"]["action"] = "ready"
							sent_msg1 = msgobj("gameend")
							sent_msg2 = status_event()
							await asyncio.wait([
								ws.send(sent_msg1),
								ws.send(sent_msg2),
								user["other_user"]["ws"].send(sent_msg1),
								user["other_user"]["ws"].send(sent_msg2)
							])
							del user["other_user"]
					else:
						# Other user disconnected
						user["action"] = "ready"
						await asyncio.wait([
							ws.send(msgobj("gameend")),
							ws.send(status_event())
						])
	finally:
		# User disconnected
		del user["ws"]
		del users[users.index(user)]
		if "other_user" in user and "ws" in user["other_user"]:
			user["other_user"]["action"] = "ready"
			await asyncio.wait([
				user["other_user"]["ws"].send(msgobj("gameend")),
				user["other_user"]["ws"].send(status_event())
			])
		if user["action"] == "waiting":
			del server_status["waiting"][user["gameid"]]
			await notify_status()

asyncio.get_event_loop().run_until_complete(
	websockets.serve(connection, "localhost", 34802)
)
asyncio.get_event_loop().run_forever()
