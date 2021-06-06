function readFile(file, arrayBuffer, encoding){
	var reader = new FileReader()
	var promise = pageEvents.load(reader).then(event => event.target.result)
	reader[arrayBuffer ? "readAsArrayBuffer" : "readAsText"](file, encoding)
	return promise
}
function filePermission(file){
	return file.queryPermission().then(response => {
		if(response === "granted"){
			return file
		}else{
			return file.requestPermission().then(response => {
				if(response === "granted"){
					return file
				}else{
					return Promise.reject(file)
				}
			})
		}
	})
}
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
			return this.blob().then(blob => readFile(blob, false, encoding))
		}else{
			return loader.ajax(this.url)
		}
	}
	blob(){
		return this.arrayBuffer().then(response => new Blob([response]))
	}
}
class LocalFile{
	constructor(file, path){
		this.file = file
		this.path = path || file.webkitRelativePath
		this.url = this.path
		this.name = file.name
	}
	arrayBuffer(){
		return readFile(this.file, true)
	}
	read(encoding){
		return readFile(this.file, false, encoding)
	}
	blob(){
		return Promise.resolve(this.file)
	}
}
class FilesystemFile{
	constructor(file, path){
		this.file = file
		this.path = path
		this.url = this.path
		this.name = file.name
	}
	arrayBuffer(){
		return this.blob().then(blob => blob.arrayBuffer())
	}
	read(encoding){
		return this.blob().then(blob => readFile(blob, false, encoding))
	}
	blob(){
		return filePermission(this.file).then(file => file.getFile())
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
			return this.blob().then(blob => readFile(blob, false, encoding))
		}else{
			return gpicker.downloadFile(this.id)
		}
	}
	blob(){
		return this.arrayBuffer().then(response => new Blob([response]))
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
	blob(){
		return this.arrayBuffer().then(response => new Blob([response]))
	}
}
