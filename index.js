var ex = require('exiv2');
var fs = require("fs")
require("shelljs/global")
var moment = require("moment")


var dirRoot = "/Volumes/256SSD/Takeout/Google Photos/"
var failed = []
var success = []

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
        //console.log(filename + " is good!")
        // Need to move this to a seperate directory, methinks
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
    setExifData(directory, filename, "DateTimeOriginal", moment(photoInformation["filenameNoExt"]).format("YYYY:MM:DD HH:MM:SS"))
  } else if (moment(photoInformation["dirName"]).isValid()) {
    setExifData(directory, filename, {
      "Exif.Photo.DateTimeOriginal": moment(photoInformation["dirName"]).format("YYYY:MM:DD HH:MM:SS")
    })
  } else {
    console.log("Failed")
    return false
  }

  //console.log(photoInformation)
}

function getPhotoInformation(directory, filename) {
  var extension = getExtension(filename)

  photoInfo = []
  photoInfo["filenameNoExt"] = filename.replace("." + extension, '').replace(".", ":")
  //console.log(photoInfo["filenameNoExt"])

  dirName = directory.replace(dirRoot,"").replace("/", "")
  dashInstances = (dirName.match(/-/g) || []).length
  if (dashInstances == 3) {
    dirName = dirName.substr(0, dirName.lastIndexOf("-"))
  }

  photoInfo["dirName"] = dirName

  return photoInfo
}

function setExifData(directory, filename, exifData) {
  ex.setImageTags(directory + filename, exifData, function(err) {
    if (err) {
      console.error(err);
    } else {
      console.log("Updated: " + directory + filename)
    }
  })
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
console.log(success)


