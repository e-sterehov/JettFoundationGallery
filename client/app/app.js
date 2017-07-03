var offset = 0

function getImages() {
  $.get("/api/images?offset=" + offset, function (data) {
    appendImages(data.entries);
    offset++;
  });
};

function appendImages(images) {
  //Capture current scroll position
  var top = $(document).scrollTop();

  var $grid = $('#grid').packery({
    itemSelector: '.grid-item',
    gutter: 0
  });

  if (images.length > 0) {
    images.forEach(function (image) {
      if (image.entry_data !== "null" && JSON.parse(decodeURIComponent(image.entry_data)).pictures !== undefined) {
        var div = $('<div>');
        div.attr('class', 'grid-item');
        var img = $('<img>');
        var pictures = JSON.parse(decodeURIComponent(image.entry_data)).pictures;
        img.attr('src', pictures[0]);
        var overlay = $('<div>');
        overlay.attr('class', 'overlay');
        var avatar = $('<img>');
        avatar.attr('src', image.author_image_url);
        avatar.attr('class', 'avatar');
        var authorLink = $('<a></a>');
        authorLink.attr('href', image.author_url);
        authorLink.attr('target', '_blank');
        authorLink.append(avatar);
        try {
          authorLink.append(decodeURIComponent((image.author_name + '').replace(/\+/g, '%20')));
        } catch (e) {
          console.log('Could not translate: ' + image.author_name);
        }

        overlay.append(authorLink);

        div.append(img);
        div.append(overlay);
        $grid.append(div)
          // add and lay out newly appended items
          .packery('appended', div);
        // img.appendTo('#grid');
      }
    });

    //When an image loads, get packery to relayout
    $grid.imagesLoaded().progress(function () {
      $grid.packery();
      //Make sure everything doesn't scroll
      $(document).scrollTop(top);
    });
  }
}

$('#uploadImageForm').submit(function () {
  $.post("/api/image", document.getElementById("formText").value, function () {
    console.log('success');
  });
  return false;
});

$(window).resize(function () {
  $grid = $('#grid').packery({
    itemSelector: '.grid-item',
    gutter: 0
  });
});

$().ready(function () {
  getImages();
});
