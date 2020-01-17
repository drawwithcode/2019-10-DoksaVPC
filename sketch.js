//unit of measure used for width and depth of all objects
var unit = 100;
//empty array that will contain all the object created
var allTheObjects = [];
//three sets of probability to be created for each kind of object, in order to make different styles
var citySet = [[0.5, 1, 0.5], [0.33, 0.33, 0.66], [0, 0, 0.66]];
//declaring the variable for the UI elements
var optionsDiv,
  selText,
  instruction1,
  instruction2,
  instruction3,
  button1,
  button2,
  button3;
//declaring variables for the model and textures of the airplane
var airplane, airplaneTex;
//boolean variable that is set to true if the user selects the third style
var airplaneIsShowing = false;

function preload() {
  //preloads the model of the airplane
  airplane = loadModel("./assets/plane.obj", true);
  //preloads the textures of the airplane
  airplaneTex = loadImage("./assets/plane_tex.jpg");
}

function setup() {
  //create a canvas with WEBGL as renderer
  createCanvas(windowWidth, windowHeight, WEBGL);
  angleMode(DEGREES);
  //creates a new random ciry with default settings
  newCity(citySet[1]);
  //sets the starting position of the camera
  camera(0, -800, -2000, 0, 0, 0, 0, 1, 0);
  //creating and styling the UI elements (a div containing a title, some instruction and three buttons)
  optionsDiv = createDiv();
  optionsDiv.position(20, 20);
  optionsDiv.class("options");
  optionsDiv.style("max-width", width / 5 + "px");
  selText = createElement("h1", "Welcome to p5 City");
  instruction3 = createElement("h3", "SELECT A STYLE:");
  button1 = createButton("");
  button1.id("ancient");
  button2 = createButton("");
  button2.id("contemporary");
  button3 = createButton("");
  button3.id("futuristic");
  instruction1 = createElement("h3", "MOVE: sunrise / sunset");
  instruction2 = createElement("h3", "DRAG: move camera");
  selText.parent(optionsDiv);
  instruction3.parent(optionsDiv);
  button1.parent(optionsDiv);
  button2.parent(optionsDiv);
  button3.parent(optionsDiv);
  instruction1.parent(optionsDiv);
  instruction2.parent(optionsDiv);
}

function draw() {
  //position of the mouse according to the center of the webGL render
  var realMouseX = mouseX - width / 2;
  var realMouseY = mouseY - height / 2;

  //creating a parabolic function with the mouse position, in order to make a smooth sunrise and sunset effect (max value = center of the screen, min value = edges)
  var sunLight = -Math.pow(map(mouseX, 0, width, -1, 1), 2);
  //using the function to define the height of the sunlight
  var lightHeight = map(sunLight, -1, 0, 10, 1000);
  //using the function to define the intensity of the sunlight
  var lightIntensity = map(sunLight, -1, 0, 0, 255);

  //background color changes according to the sunlight
  background(
    lightIntensity * 0.5 + 10,
    lightIntensity * 0.7,
    lightIntensity * 1 + 10
  );
  //soft ambient light
  ambientLight(80, 80, 110);
  //point light simulating the sun (it feels better than directional light to me)
  pointLight(
    //making the light turn red near the edges of the screen and white around the center
    lightIntensity * 3 + 10,
    lightIntensity + 10,
    lightIntensity + 10,
    -realMouseX,
    -lightHeight,
    -1000
  );

  //a sphere simulates the sun and changes color according to the current color of the sunlight
  push();
  noStroke();
  rotateZ(map(mouseX, 0, width, -70, -290));
  translate(0, 1100);
  emissiveMaterial(
    lightIntensity * 3,
    lightIntensity * 1.2,
    lightIntensity * 0.8
  );
  sphere(50);
  pop();

  //lets the user drag and move the camera
  orbitControl();

  //basics plane
  push();
  noStroke();
  rotateX(90);
  ambientMaterial(60);
  plane(2000, 2000);
  pop();

  //making all the random object appear
  for (var y = 0; y < allTheObjects.length; y++) {
    var house = allTheObjects[y];
    house.display();
  }

  //an airplane model appears and rotates in the sky when the third style is selected by the user
  if (airplaneIsShowing === true) {
    push();
    noStroke();
    rotateY(frameCount);
    translate(400, -800, 0);
    rotateZ(180);
    texture(airplaneTex);
    model(airplane);
    pop();
  }

  //click to change the "style" of the city
  button1.mouseClicked(newCity1);
  button2.mouseClicked(newCity2);
  button3.mouseClicked(newCity3);
}

//constructor object of the houses with variable height, x position and z position
function House(_height, _x, _z) {
  this.x = _x;
  this.z = _z;
  this.buildWidth = unit;
  this.buildHeight = _height;
  this.roofHeight = this.buildHeight * 0.5;
  this.y = -this.buildHeight / 2;

  this.display = function() {
    //house composed by a box, a cone and other two boxes for the windows
    push();
    translate(this.x, this.y, this.z);
    push();
    noStroke();
    ambientMaterial(200, 180, 160);
    box(this.buildWidth, this.buildHeight, this.buildWidth);
    pop();
    push();
    translate(
      -this.buildWidth * 0.25,
      -this.buildWidth * 0.1,
      -this.buildWidth * 0.5
    );
    ambientMaterial(200);
    box(this.buildWidth * 0.15, this.buildWidth * 0.2, 2);
    pop();
    push();
    translate(
      this.buildWidth * 0.25,
      -this.buildWidth * 0.1,
      -this.buildWidth * 0.5
    );
    ambientMaterial(200);
    box(this.buildWidth * 0.15, this.buildWidth * 0.2, 2);
    pop();
    push();
    translate(0, -this.buildHeight / 2 - this.roofHeight / 2);
    rotateX(180);
    rotateY(45);
    noStroke();
    ambientMaterial(82, 29, 29);
    cone(80, this.roofHeight, 4, 1);
    pop();
    pop();
  };
}

//constructor object of the skyscrapers with variable height, x position and z position
function Skyscraper(_height, _x, _z) {
  this.x = _x;
  this.z = _z;
  this.buildWidth = unit;
  this.buildHeight = _height;
  this.roofHeight = this.buildHeight * 0.1;
  this.y = -this.buildHeight / 2;

  this.display = function() {
    //a skyscraper composed by one or more box (depending on the random height, to differentiate more between them)
    push();
    translate(this.x, this.y, this.z);
    push();
    noStroke();
    specularMaterial(143, 142, 136);
    box(this.buildWidth, this.buildHeight, this.buildWidth);
    pop();

    if (this.buildHeight > 400) {
      push();
      noStroke();
      translate(0, -this.buildHeight / 2 - this.roofHeight / 2);
      ambientMaterial(64, 63, 58);
      box(this.buildWidth * 0.8, this.roofHeight, this.buildWidth * 0.8);
      pop();
      push();
      noStroke();
      translate(
        0,
        -this.buildHeight / 2 -
          this.roofHeight / 2 -
          (this.buildHeight * 0.3) / 2
      );
      ambientMaterial(143, 142, 136);
      box(this.buildWidth * 0.1, this.buildHeight * 0.3, this.buildWidth * 0.1);
      pop();
    }
    pop();
  };
}

//constructor object of the tree with variable width, height, x position and z position
function Tree(_width, _height, _x, _z) {
  this.x = _x;
  this.z = _z;
  this.treeWidth = _width;
  this.treeHeight = _height;
  this.y = -this.treeHeight / 2;

  this.display = function() {
    push();
    translate(this.x, this.y, this.z);
    //a green plane serves as grass basis for each tree
    push();
    noStroke();
    translate(0, -this.y - 0.1);
    rotateX(90);
    ambientMaterial(118, 189, 60);
    plane(150, 150);
    pop();
    //the tree is composed by three cones
    push();
    noStroke();
    rotateX(180);
    ambientMaterial(118, 189, 60);
    cone(this.treeWidth, this.treeHeight, 20, 1);
    pop();
    push();
    noStroke();
    translate(0, -this.treeHeight * 0.1);
    rotateX(180);
    ambientMaterial(118, 189, 60);
    cone(this.treeWidth * 0.85, this.treeHeight * 0.7, 20, 1);
    pop();
    push();
    noStroke();
    translate(0, -this.treeHeight * 0.45);
    rotateX(180);
    ambientMaterial(118, 189, 60);
    cone(this.treeWidth * 0.7, this.treeHeight * 0.6, 20, 1);
    pop();
    pop();
  };
}

//creates a new random city with "village style" settings, the airplane doesn't show up
function newCity1() {
  newCity(citySet[0]);
  airplaneIsShowing = false;
}
//creates a new random city with "city style" settings, the airplane doesn't show up
function newCity2() {
  newCity(citySet[1]);
  airplaneIsShowing = false;
}
//creates a new random city with "metropoli style" settings, the airplane shows up
function newCity3() {
  newCity(citySet[2]);
  airplaneIsShowing = true;
}

//creates a new random city using the different sets of possibility passed as argument in the function to define a general style
function newCity(set) {
  var newObjects = [];
  for (var x = -750; x <= 750; x += 150) {
    for (var z = -750; z <= 750; z += 150) {
      var casualObj = Math.random();
      if (casualObj < set[0]) {
        var randomHouse = new House(random(60, 100), x, z);
        newObjects.push(randomHouse);
      } else if (casualObj >= set[1] && casualObj <= set[2]) {
        var skyscraper = new Skyscraper(random(120, 450), x, z);
        newObjects.push(skyscraper);
      } else if (casualObj > set[2]) {
        var tree = new Tree(random(25, 35), random(45, 60), x, z);
        newObjects.push(tree);
      }
    }
  }
  //updates the objects to be displayed with the new ones
  allTheObjects = newObjects;
}
