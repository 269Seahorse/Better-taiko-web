#!/usr/bin/env python

import asyncio
import websockets
import json
import random
import sys

server_status = {
	"waiting": {},
	"users": [],
	"invites": {}
}
consonants = "bcdfghjklmnpqrstvwxyz"

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

def get_invite():
	return "".join([random.choice(consonants) for x in range(5)])

async def notify_status():
	ready_users = [user for user in server_status["users"] if "ws" in user and user["action"] == "ready"]
	if ready_users:
		sent_msg = status_event()
		await asyncio.wait([user["ws"].send(sent_msg) for user in ready_users])

async def connection(ws, path):
	# User connected
	user = {
		"ws": ws,
		"action": "ready",
		"session": False
	}
	server_status["users"].append(user)
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
			except websockets.exceptions.ConnectionClosed:
				# Connection closed
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
						if value == None:
							continue
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
								del user["other_user"]
								user["action"] = "waiting"
								user["gameid"] = id
								waiting[id] = {
									"user": user,
									"diff": diff
								}
								await ws.send(msgobj("waiting"))
						# Update others on waiting players
						await notify_status()
					elif type == "invite":
						if value == None:
							# Session invite link requested
							invite = get_invite()
							server_status["invites"][invite] = user
							user["action"] = "invite"
							user["session"] = invite
							await ws.send(msgobj("invite", invite))
						elif value in server_status["invites"]:
							# Join a session with the other user
							user["other_user"] = server_status["invites"][value]
							del server_status["invites"][value]
							if "ws" in user["other_user"]:
								user["other_user"]["other_user"] = user
								user["action"] = "invite"
								user["session"] = value
								sent_msg = msgobj("session")
								await asyncio.wait([
									ws.send(sent_msg),
									user["other_user"]["ws"].send(sent_msg)
								])
								await ws.send(msgobj("invite"))
							else:
								del user["other_user"]
								await ws.send(msgobj("gameend"))
						else:
							# Session code is invalid
							await ws.send(msgobj("gameend"))
				elif action == "waiting" or action == "loading" or action == "loaded":
					# Waiting for another user
					if type == "leave":
						# Stop waiting
						if user["session"]:
							if "other_user" in user and "ws" in user["other_user"]:
								user["action"] = "songsel"
								await asyncio.wait([
									ws.send(msgobj("left")),
									user["other_user"]["ws"].send(msgobj("users", []))
								])
							else:
								user["action"] = "ready"
								user["session"] = False
								await asyncio.wait([
									ws.send(msgobj("gameend")),
									ws.send(status_event())
								])
						else:
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
						if type == "note"\
							or type == "drumroll"\
							or type == "branch"\
							or type == "gameresults":
							await user["other_user"]["ws"].send(msgobj(type, value))
						elif type == "songsel" and user["session"]:
							user["action"] = "songsel"
							user["other_user"]["action"] = "songsel"
							sent_msg1 = msgobj("songsel")
							sent_msg2 = msgobj("users", [])
							await asyncio.wait([
								ws.send(sent_msg1),
								ws.send(sent_msg2),
								user["other_user"]["ws"].send(sent_msg1),
								user["other_user"]["ws"].send(sent_msg2)
							])
						elif type == "gameend":
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
							del user["other_user"]["other_user"]
							del user["other_user"]
					else:
						# Other user disconnected
						user["action"] = "ready"
						user["session"] = False
						await asyncio.wait([
							ws.send(msgobj("gameend")),
							ws.send(status_event())
						])
				elif action == "invite":
					if type == "leave":
						# Cancel session invite
						if user["session"] in server_status["invites"]:
							del server_status["invites"][user["session"]]
						user["action"] = "ready"
						user["session"] = False
						if "other_user" in user and "ws" in user["other_user"]:
							user["other_user"]["action"] = "ready"
							user["other_user"]["session"] = False
							sent_msg = status_event()
							await asyncio.wait([
								ws.send(msgobj("left")),
								ws.send(sent_msg),
								user["other_user"]["ws"].send(msgobj("gameend")),
								user["other_user"]["ws"].send(sent_msg)
							])
						else:
							await asyncio.wait([
								ws.send(msgobj("left")),
								ws.send(status_event())
							])
					elif type == "songsel" and "other_user" in user:
						if "ws" in user["other_user"]:
							user["action"] = "songsel"
							user["other_user"]["action"] = "songsel"
							sent_msg = msgobj(type)
							await asyncio.wait([
								ws.send(sent_msg),
								user["other_user"]["ws"].send(sent_msg)
							])
						else:
							user["action"] = "ready"
							user["session"] = False
							await asyncio.wait([
								ws.send(msgobj("gameend")),
								ws.send(status_event())
							])
				elif action == "songsel":
					# Session song selection
					if "other_user" in user and "ws" in user["other_user"]:
						if type == "songsel":
							# Change song select position
							if user["other_user"]["action"] == "songsel":
								sent_msg = msgobj(type, value)
								await asyncio.wait([
									ws.send(sent_msg),
									user["other_user"]["ws"].send(sent_msg)
								])
						elif type == "join":
							# Start game
							if value == None:
								continue
							id = value["id"] if "id" in value else None
							diff = value["diff"] if "diff" in value else None
							if not id or not diff:
								continue
							if user["other_user"]["action"] == "waiting":
								user["action"] = "loading"
								user["other_user"]["action"] = "loading"
								await asyncio.wait([
									ws.send(msgobj("gameload", user["other_user"]["gamediff"])),
									user["other_user"]["ws"].send(msgobj("gameload", diff))
								])
							else:
								user["action"] = "waiting"
								user["gamediff"] = diff
								await user["other_user"]["ws"].send(msgobj("users", [{
									"id": id,
									"diff": diff
								}]))
						elif type == "gameend":
							# User wants to disconnect
							user["action"] = "ready"
							user["session"] = False
							user["other_user"]["action"] = "ready"
							user["other_user"]["session"] = False
							sent_msg1 = msgobj("gameend")
							sent_msg2 = status_event()
							await asyncio.wait([
								ws.send(sent_msg1),
								ws.send(sent_msg2),
								user["other_user"]["ws"].send(sent_msg1),
								user["other_user"]["ws"].send(sent_msg2)
							])
							del user["other_user"]["other_user"]
							del user["other_user"]
					else:
						# Other user disconnected
						user["action"] = "ready"
						user["session"] = False
						await asyncio.wait([
							ws.send(msgobj("gameend")),
							ws.send(status_event())
						])
	finally:
		# User disconnected
		del user["ws"]
		del server_status["users"][server_status["users"].index(user)]
		if "other_user" in user and "ws" in user["other_user"]:
			user["other_user"]["action"] = "ready"
			user["other_user"]["session"] = False
			await asyncio.wait([
				user["other_user"]["ws"].send(msgobj("gameend")),
				user["other_user"]["ws"].send(status_event())
			])
			del user["other_user"]["other_user"]
		if user["action"] == "waiting":
			del server_status["waiting"][user["gameid"]]
			await notify_status()
		elif user["action"] == "invite" and user["session"] in server_status["invites"]:
			del server_status["invites"][user["session"]]

port = int(sys.argv[1]) if len(sys.argv) > 1 else 34802
print('Starting server on port %d' % port)
asyncio.get_event_loop().run_until_complete(
	websockets.serve(connection, "localhost", port)
)
asyncio.get_event_loop().run_forever()
