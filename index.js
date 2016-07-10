var ex = require('exiv2');
var fs = require("fs")
require("shelljs/global")
var moment = require("moment")


var dirRoot = "/Volumes/256SSD/Takeout/Google Photos/"
var failed = []

function getSubDirectories(directory) {
  return (ls(directory))
}

function getPhotosInDirectory(directory) {
  var files = []
  files = files.concat(ls(directory))

  return files
}

function getExtension(filename) {
  return (filename.substring(filename.lastIndexOf(".") + 1))
}

function processFile(directory, filename, extension) {
  var extension = getExtension(filename)
  if (extension.toLowerCase() == "json") {
    // Figure this out later
    return "false"
  }
  //console.log(directory + filename)
  ex.getImageTags(directory + filename, function(err, tags) {

    if (tags) {
      if (!tags["Exif.Photo.DateTimeOriginal"]) {
        updatePhoto(directory, filename)
      } else {
        return true
      }
    } else {
      updatePhoto(directory, filename)
    }

  })


}

function updatePhoto(directory, filename) {
  photoInformation = getPhotoInformation(directory, filename)

  if (moment(photoInformation["filenameNoExt"]).isValid()) {
    console.log(moment(photoInformation["filenameNoExt"]).format())
  } else {
    if (moment(photoInformation["dirName"]).isValid()) {
      console.log(moment(photoInformation["dirName"]).format())
    } else {
      failed.push(directory + filename)
      return false
    }
  }

  //console.log(photoInformation)
}

function getPhotoInformation(directory, filename) {
  var extension = getExtension(filename)

  photoInfo = []
  photoInfo["filenameNoExt"] = filename.replace("." + extension, '')

  dirName = directory.replace(dirRoot,"").replace("/", "")
  dashInstances = (dirName.match(/-/g) || []).length
  if (dashInstances == 3) {
    dirName = dirName.substr(0, dirName.lastIndexOf("-"))
  }

  photoInfo["dirName"] = dirName

  return photoInfo
}

function setExifData(directory, filename, exifTag, data) {

}

function checkDate() {

}

var directories = getSubDirectories(dirRoot)

directories.forEach(function(dir) {
  jsonFiles = []
  files = getPhotosInDirectory(dirRoot + dir)
  files.forEach(function(filename) {
    processFile(dirRoot + dir + "/", filename)
  })
})

console.log(failed)


