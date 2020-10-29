class RemoteFile{
	constructor(url){
		this.url = url
		try{
			this.path = new URL(url).pathname
		}catch(e){
			this.path = url
		}
		if(this.path.startsWith("/")){
			this.path = this.path.slice(1)
		}
		this.name = this.path
		var index = this.name.lastIndexOf("/")
		if(index !== -1){
			this.name = this.name.slice(index + 1)
		}
	}
	arrayBuffer(){
		return loader.ajax(this.url, request => {
			request.responseType = "arraybuffer"
		})
	}
	read(encoding){
		if(encoding){
			return this.arrayBuffer().then(response =>
				new TextDecoder(encoding).decode(response)
			)
		}else{
			return loader.ajax(this.url)
		}
	}
}
class LocalFile{
	constructor(file){
		this.file = file
		this.path = file.webkitRelativePath
		this.url = this.path
		this.name = file.name
	}
	arrayBuffer(){
		var reader = new FileReader()
		var promise = pageEvents.load(reader).then(event => event.target.result)
		reader.readAsArrayBuffer(this.file)
		return promise
	}
	read(encoding){
		var reader = new FileReader()
		var promise = pageEvents.load(reader).then(event => event.target.result)
		reader.readAsText(this.file, encoding)
		return promise
	}
}
class GdriveFile{
	constructor(fileObj){
		this.path = fileObj.path
		this.name = fileObj.name
		this.id = fileObj.id
		this.url = gpicker.filesUrl + this.id + "?alt=media"
	}
	arrayBuffer(){
		return gpicker.downloadFile(this.id, true)
	}
	read(encoding){
		if(encoding){
			return this.arrayBuffer().then(response => {
				var reader = new FileReader()
				var promise = pageEvents.load(reader).then(event => event.target.result)
				reader.readAsText(new Blob([response]), encoding)
				return promise
			})
		}else{
			return gpicker.downloadFile(this.id)
		}
	}
}
class CachedFile{
	constructor(contents, oldFile){
		this.contents = contents
		this.oldFile = oldFile
		this.path = oldFile.path
		this.name = oldFile.name
		this.url = oldFile.url
	}
	arrayBuffer(){
		return Promise.resolve(this.contents)
	}
	read(encoding){
		return this.arrayBuffer()
	}
}
