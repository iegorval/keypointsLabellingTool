var keypoints; var curCategoryKeypoints; var curCategoryIdx; var curKeypointNames;
var keypointCategories = [
    "left_front_list", "right_front_list", "left_back_list", "right_back_list", "body_head_list"
];
var allKeypointNames = [
    "hoof", "dewclaw", "knee", "elbow", "shoulder blade", 
    "hoof", "dewclaw", "knee", "elbow", "shoulder blade",
    "hoof", "cannon", "hock", "thigh", "thurl",
    "hoof", "cannon", "hock", "thigh", "thurl",
    "left eye", "right eye", "nose", "chin", "neck", "tail start"
];
var colorList = ["#ff0000", "#77b300", "#0000ff", "#ff99ff", "#81d8d0"];
var removedKeypoint;

window.addEventListener("DOMContentLoaded", function() {
    var image  = document.getElementById("img_labeling");
    var canvasImage = document.getElementById("canvas_image");
    var keypointsDiv = document.getElementById("keypoints_div");
    var resetButton = document.getElementById("reset_button");
    var toggleCheckbox = document.getElementById("switch_visibility");
    keypointsDiv.addEventListener("click", addVisibleKeypoint);
    keypointsDiv.addEventListener("contextmenu", addInvisibleKeypoint);
    resetButton.addEventListener("click", resetAllKeypoints);
    toggleCheckbox.addEventListener("click", toggleLabelsVisibility);

    keypoints = []; removedKeypoint = [];
    curCategoryKeypoints = 0; curCategoryIdx = 0;
    image.onload = function() {
        var maxWidth = 1000;
        var maxHeight = image.height * (maxWidth / image.width);
        var width = Math.min(maxWidth, image.width);
        var height = Math.min(maxHeight, image.height);
        canvasImage.width = width; canvasImage.height = height;
        keypointsDiv.style.width = width + 2; keypointsDiv.style.height = height + 2;
        var contextImage = canvasImage.getContext("2d");
        contextImage.drawImage(image, 0, 0, width, height);     
        var firstCategory = document.getElementById(keypointCategories[0]);
        var firstLabel = firstCategory.getElementsByTagName("p")[0];
        firstLabel.classList.add("activeKeypoint");
    }
});

function removeKeypoint(keypoint, label) {
    if (removedKeypoint.length == 0) {
        var lastRemovedIdx = label.title.split(" ")[0];
        keypoints.splice(lastRemovedIdx, 1);
        removedKeypoint.push(label.title);
        keypoint.remove();
        label.remove();
    }
}

function processKeypointsArray(x, y, vis, label) {
    var curCategoryIdxModified = curCategoryIdx;
    if (removedKeypoint.length == 0) {
        keypoints.push([x, y, vis]);
        label.title = (keypoints.length - 1) + " " + curCategoryIdx;
        label.innerHTML = allKeypointNames[keypoints.length - 1];
        if (!vis) label.innerHTML = label.innerHTML + " (invisible)";
        curCategoryKeypoints += 1;
    } else {
        var lastRemoved = removedKeypoint.pop()
        var lastRemovedIdx = lastRemoved.split(" ")[0];
        curCategoryIdxModified = lastRemoved.split(" ")[1];
        keypoints.splice(lastRemovedIdx, 0, [x, y, vis]);
        label.title = lastRemoved;
        label.innerHTML = allKeypointNames[lastRemovedIdx];
    }   
    return curCategoryIdxModified;
}

function addKeypointToHtml(x, y, vis, label, categoryIdx) {
    var toggleCheckbox = document.getElementById("switch_visibility");
    var keypoint = document.createElement("span");
    label.classList.add("keypointLabel");
    label.style.left = x + 11;
    label.style.top = y + 11;
    if (!toggleCheckbox.checked) {
        label.style.visibility = 'visible';
    } else {
        label.style.visibility = 'hidden';
    }
    keypoint.classList.add("keypoint");
    keypoint.style.backgroundColor = colorList[categoryIdx];
    if (vis) keypoint.style.opacity = 1.0;
    else keypoint.style.opacity = 0.3;
    keypoint.style.left = x;
    keypoint.style.top = y; 
    keypoint.addEventListener("click", function(event){ event.stopPropagation(); }, false);
    keypoint.addEventListener("click", function(){ removeKeypoint(keypoint, label); }, false);
    var keypointsDiv = document.getElementById("keypoints_div");
    keypointsDiv.appendChild(keypoint);
    keypointsDiv.appendChild(label);
}

function addKeypoint(x, y, vis) {
    if (curCategoryIdx < keypointCategories.length) {
        var curKeypoints = document.getElementById(keypointCategories[curCategoryIdx]).getElementsByTagName("li");
        var label = document.createElement("label");
        var categoryIdx = processKeypointsArray(x, y, vis, label);
        addKeypointToHtml(x, y, vis, label, categoryIdx);
        var nextKeypoint = curKeypoints[curCategoryKeypoints - 1];
        nextKeypoint.classList.add("activeKeypoint");
        if (curCategoryKeypoints == curKeypoints.length) { 
            curCategoryKeypoints = 0; 
            curCategoryIdx += 1; 
            var nextCategory = document.getElementById(keypointCategories[curCategoryIdx]); 
            if (nextCategory !== null) {
                var nextLabel = nextCategory.getElementsByTagName("p")[0];
                nextLabel.classList.add("activeKeypoint");
            }
        }
    }
}

function addInvisibleKeypoint(event) {
    event.preventDefault();
    var x = event.offsetX;
    var y = event.offsetY;
    addKeypoint(x, y, false);
}

function addVisibleKeypoint(event) {
    var x = event.offsetX;
    var y = event.offsetY;
    addKeypoint(x, y, true);
}

function resetAllKeypoints() {
    keypoints = [];
    for (var categoryIdx = 0; categoryIdx <= Math.min(curCategoryIdx, keypointCategories.length-1); categoryIdx++) {
        var category = document.getElementById(keypointCategories[categoryIdx]);
        category.classList.remove("activeKeypoint");
        var curKeypoints = category.getElementsByTagName("li");
        var curLabel = category.getElementsByTagName("p")[0];
        if (categoryIdx != 0) curLabel.classList.remove("activeKeypoint");
        for (var i = 0; i < curKeypoints.length; i++) {
            curKeypoints[i].classList.remove("activeKeypoint");
        }
    }
    curCategoryIdx = 0;
    curCategoryKeypoints = 0;
    var keypointsDiv = document.getElementById("keypoints_div");
    keypointsDiv.innerHTML = "";
}

function toggleLabelsVisibility() {
    var keypointsDiv = document.getElementById("keypoints_div");
    var kp = keypointsDiv.children;
    var toggleCheckbox = document.getElementById("switch_visibility");
    for (var i = 0; i < kp.length; i++) {
        if (kp[i].classList.item(0) === "keypointLabel") {
            if (!toggleCheckbox.checked) {
                kp[i].style.visibility = 'visible';
            } else {
                kp[i].style.visibility = 'hidden';
            }
        }
    }
}