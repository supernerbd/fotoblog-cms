//cloud code onedoteight.net main.js

var Image = require("parse-image");

Parse.Cloud.beforeSave("pic", function(request, response) {
  var user = request.object;
  if (!user.get("file")) {
    response.error("File required.");
    return;
  }

  if (!user.dirty("file")) {
    // The profile photo isn't being modified.
    response.success();
    return;
  }

  Parse.Cloud.httpRequest({
    url: user.get("file").url()

  }).then(function(response) {
    var image = new Image();
    return image.setData(response.buffer);

  }).then(function(image) {
    // Resize the image to 64x64.
    return image.scale({
      ratio: 0.5
	});

  }).then(function(image) {
    // Get the image data in a Buffer.
    return image.data();

  }).then(function(buffer) {
    // Save the image into a new file.
    var base64 = buffer.toString("base64");
    var cropped = new Parse.File("fileSmall.jpg", { base64: base64 });
    return cropped.save();

  }).then(function(cropped) {
    // Attach the image file to the original object.
    user.set("fileSmall", cropped);

  }).then(function(result) {
    response.success();
  }, function(error) {
    response.error(error);
  });
});