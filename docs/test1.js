// Data loading

canvas = false;
markers = []

function generate_canvas (){
  if(canvas) // do nothing if the canvas has been generated
    return canvas

  var img = document.getElementById('height_data');
  canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height);
}


window.onload = function(){
  generate_canvas()
  load_method('gdesc')
}



function load_method(name){
  document.getElementById('function_text').innerText = methods[name].function
  document.getElementById('params_text').innerText = methods[name].init_params
}




// Functions related to the data

function get_value(pixel){
  // Get the data value at the nearest pixel
  var [x,y] = pixel;
  var pixelData = canvas.getContext('2d')
              .getImageData(pixel[0], pixel[1], 1, 1)
              .data;
  var  h = translator.height[pixelData[0]]
  var gx = translator.gx[pixelData[1]]
  var gy = translator.gy[pixelData[2]]
  return [h,gx,gy]
}


// Functions related to runing the algorithm

function random_p0(){
  while(true){
    var x = Math.random()*canvas.width;
    var y =  Math.random()*canvas.width;
    var [h,gx,gy] = get_value([x,y])
    if(h>10) return [x,y]
  }
}

function randomize(){
  var [x,y] = random_p0();
  document.getElementById('x').value = Math.round(x);
  document.getElementById('y').value = Math.round(y);
}

function run(){
  var method = document.getElementById('function_text').innerText
  var init_params = document.getElementById('params_text').innerText
  var p0 = [Number(document.getElementById('x').value),
        Number(document.getElementById('y').value)]
  var iters = Number(document.getElementById('nits').value)
  var result = iterate(method,init_params, p0, iters)
  draw_lines(result)
}


function iterate(_method, _init_params, _p0, _iters){
  _result = [_p0]

  eval(_init_params)
  eval('var _iter_step = '+_method)

  for(var _i = 0; _i< _iters;_i++){
    var [_h,_gx,_gy] = get_value(_p0)
    _p0 = _iter_step(_p0,[_gx,_gy],_h)
    _result.push(_p0) 
    if(_p0[0]<0 || _p0[0]>canvas.width ||
       _p0[1]<0 || _p0[1]>canvas.height )
      break;
  }
  return _result
}


// Plotting in GMAPS

function draw_lines(coords){
        var gmaps_coords = coords.map(px2coords)

        var path = new google.maps.Polyline({
          path: gmaps_coords,
          geodesic: true,
          strokeColor: '#FF0000',
          strokeOpacity: 1.0,
          strokeWeight: 2
        });

        path.setMap(map);
        markers.push(path)
}

function clear_markers(){

  markers.forEach(x => x.setMap(null))
}
      function initMap() {
        map = new google.maps.Map(document.getElementById('map'), {
          zoom: 8,
          center: {lat: 42.5, lng: 2.5},
          mapTypeId: 'terrain',
          keyboardShortcuts : false
        });
        google.maps.event.addListener(map, 'click', function(event) {
           var latlng = {'lat':event.latLng.lat(),'lng':event.latLng.lng()}
           var px =coords2px(latlng)
           document.getElementById('x').value = px[0];
           document.getElementById('y').value = px[1];
           run()
        });
      }


function coords2px(coords){
  var x = (coords.lng-translator.left)/(translator.right-translator.left)*canvas.width
  var y = (coords.lat- translator.top)/(translator.bottom-translator.top)*canvas.height
  return [x,y]
}

function px2coords(px){
  var [x,y] = px;
  var lng = translator.left + (x+0.)/canvas.width * (translator.right-translator.left)
  var lat = translator.top  + (y+0.)/canvas.height* (translator.bottom-translator.top)
  return {'lng':lng,'lat':lat}
}

// Under here there is only data


var methods = {
  'gdesc': {
    'name': 'Gradient Descent',
    'init_params' :
`var STEP = 1;
// avoid names starting by '_'`,
    'function':
`function(pos,grad,height){
  var [x,y] = pos;
  var [gx,gy] = grad;
  return [x-STEP*gx,y-STEP*gy]
}`
  },
  'moment': {
    'name': 'Moment Metod',
    'init_params' :
`var FRICTION = .05;
var STEP = 1;
var vx = 0;
var vy = 0;
// avoid names starting by '_'`,
    'function':
`function(pos,grad,height){
  var [x,y] = pos;
  var [gx,gy] = grad;
  vx-=gx*STEP;vy-=gy*STEP
  vx*=(1-FRICTION)
  vy*=(1-FRICTION)
  return [x+vx,y+vy]
}`
  },
'custom':{
    'name': 'Custom',
    'init_params' :
`// declare global variables
// avoid names starting by '_'`,
    'function':
`function(pos,grad,height){
  var [x,y] = pos;
  var [gx,gy] = grad;
  // Write your Javascript code here
}`
  },
}


// Hardcoded, this is a baad baad idea
var translator = {"right": 5.000416715065181, "bottom": 39.999583575446934, "top": 45.00041690878027, "gy": [-45.95, -31.96, -27.15, -23.99, -21.78, -19.93, -18.46, -17.16, -16.07, -15.11, -14.23, -13.38, -12.58, -11.88, -11.17, -10.59, -10.05, -9.54, -9.09, -8.67, -8.28, -7.96, -7.63, -7.32, -7.02, -6.75, -6.5, -6.25, -6.04, -5.82, -5.61, -5.4, -5.2, -5.02, -4.85, -4.69, -4.54, -4.4, -4.27, -4.14, -4.01, -3.89, -3.78, -3.68, -3.57, -3.47, -3.38, -3.29, -3.2, -3.12, -3.04, -2.96, -2.89, -2.81, -2.74, -2.67, -2.61, -2.54, -2.48, -2.42, -2.36, -2.3, -2.23, -2.18, -2.12, -2.07, -2.02, -1.97, -1.92, -1.87, -1.82, -1.77, -1.73, -1.69, -1.65, -1.6, -1.56, -1.52, -1.47, -1.43, -1.39, -1.36, -1.32, -1.28, -1.24, -1.21, -1.17, -1.13, -1.1, -1.06, -1.02, -0.99, -0.95, -0.92, -0.88, -0.85, -0.81, -0.78, -0.75, -0.72, -0.68, -0.65, -0.62, -0.59, -0.56, -0.53, -0.51, -0.48, -0.45, -0.43, -0.4, -0.38, -0.35, -0.33, -0.3, -0.28, -0.26, -0.23, -0.21, -0.19, -0.17, -0.15, -0.13, -0.11, -0.09, -0.08, -0.06, -0.05, -0.03, -0.02, -0.01, -0.0, -0.0, -0.0, 0.0, 0.0, 0.01, 0.02, 0.03, 0.04, 0.06, 0.07, 0.09, 0.11, 0.12, 0.14, 0.16, 0.18, 0.2, 0.22, 0.24, 0.26, 0.28, 0.3, 0.33, 0.35, 0.38, 0.4, 0.43, 0.45, 0.47, 0.5, 0.52, 0.55, 0.58, 0.61, 0.64, 0.67, 0.7, 0.73, 0.76, 0.79, 0.82, 0.86, 0.9, 0.93, 0.97, 1.01, 1.05, 1.08, 1.12, 1.16, 1.2, 1.25, 1.29, 1.33, 1.38, 1.43, 1.47, 1.52, 1.57, 1.62, 1.67, 1.73, 1.78, 1.83, 1.88, 1.93, 1.99, 2.05, 2.11, 2.18, 2.24, 2.3, 2.37, 2.44, 2.51, 2.58, 2.66, 2.74, 2.83, 2.92, 3.0, 3.09, 3.19, 3.29, 3.39, 3.5, 3.62, 3.73, 3.86, 3.99, 4.13, 4.28, 4.44, 4.61, 4.78, 4.97, 5.16, 5.38, 5.6, 5.84, 6.09, 6.37, 6.66, 6.99, 7.32, 7.7, 8.1, 8.53, 9.01, 9.52, 10.1, 10.73, 11.39, 12.15, 12.93, 13.91, 14.9, 15.95, 17.22, 18.95, 21.15, 23.76, 27.85, 50.5], "gx": [-47.55, -25.12, -20.48, -17.59, -15.66, -14.17, -12.99, -12.01, -11.13, -10.43, -9.81, -9.3, -8.79, -8.34, -7.93, -7.55, -7.2, -6.87, -6.56, -6.29, -6.02, -5.77, -5.53, -5.32, -5.11, -4.91, -4.73, -4.56, -4.39, -4.24, -4.1, -3.95, -3.82, -3.69, -3.56, -3.44, -3.33, -3.22, -3.12, -3.02, -2.93, -2.84, -2.76, -2.68, -2.61, -2.54, -2.47, -2.4, -2.34, -2.28, -2.23, -2.17, -2.11, -2.06, -2.0, -1.95, -1.9, -1.85, -1.81, -1.76, -1.72, -1.67, -1.63, -1.59, -1.55, -1.51, -1.47, -1.43, -1.4, -1.36, -1.32, -1.29, -1.25, -1.22, -1.19, -1.15, -1.12, -1.09, -1.05, -1.02, -0.99, -0.96, -0.93, -0.9, -0.87, -0.84, -0.81, -0.78, -0.76, -0.73, -0.7, -0.68, -0.65, -0.63, -0.6, -0.58, -0.56, -0.53, -0.51, -0.49, -0.46, -0.44, -0.42, -0.4, -0.37, -0.35, -0.33, -0.31, -0.29, -0.27, -0.25, -0.23, -0.21, -0.19, -0.17, -0.16, -0.14, -0.12, -0.11, -0.09, -0.08, -0.06, -0.05, -0.04, -0.03, -0.02, -0.01, -0.0, -0.0, 0.0, 0.0, 0.0, 0.01, 0.02, 0.03, 0.05, 0.06, 0.07, 0.09, 0.1, 0.12, 0.13, 0.15, 0.17, 0.18, 0.2, 0.22, 0.23, 0.25, 0.27, 0.29, 0.31, 0.33, 0.35, 0.37, 0.39, 0.41, 0.44, 0.46, 0.48, 0.5, 0.53, 0.55, 0.58, 0.6, 0.63, 0.65, 0.68, 0.7, 0.73, 0.76, 0.79, 0.81, 0.84, 0.87, 0.9, 0.93, 0.96, 0.99, 1.02, 1.05, 1.08, 1.11, 1.14, 1.18, 1.21, 1.25, 1.28, 1.31, 1.35, 1.39, 1.42, 1.46, 1.5, 1.54, 1.58, 1.62, 1.66, 1.71, 1.75, 1.8, 1.84, 1.89, 1.94, 1.99, 2.04, 2.09, 2.15, 2.2, 2.26, 2.32, 2.38, 2.44, 2.51, 2.58, 2.65, 2.74, 2.82, 2.91, 2.99, 3.08, 3.18, 3.29, 3.39, 3.51, 3.62, 3.74, 3.86, 3.99, 4.14, 4.31, 4.47, 4.66, 4.84, 5.03, 5.25, 5.49, 5.74, 6.02, 6.31, 6.65, 7.01, 7.42, 7.89, 8.43, 9.02, 9.74, 10.53, 11.47, 12.67, 14.02, 15.54, 17.58, 20.21, 24.63, 51.63], "height": [0.0, 0.25, 1.14, 2.65, 5.0, 7.99, 11.38, 16.39, 21.18, 26.33, 30.21, 33.2, 37.02, 41.12, 44.66, 48.1, 51.62, 55.16, 58.54, 61.99, 65.34, 69.15, 72.42, 75.69, 78.93, 82.28, 85.55, 88.64, 91.5, 94.07, 96.67, 99.22, 101.73, 104.38, 107.36, 110.26, 112.7, 114.93, 117.1, 119.4, 121.82, 124.16, 126.34, 128.49, 130.64, 132.76, 134.74, 136.79, 138.92, 141.12, 143.24, 145.21, 147.36, 149.06, 150.97, 152.83, 154.92, 156.81, 158.6, 160.6, 162.72, 165.04, 167.17, 169.44, 171.65, 173.74, 176.13, 178.1, 180.33, 182.45, 184.7, 187.0, 188.88, 190.88, 192.87, 194.9, 197.0, 199.12, 201.31, 203.59, 205.75, 207.99, 210.26, 212.52, 214.97, 217.34, 219.7, 222.02, 224.35, 226.81, 229.16, 231.52, 233.7, 235.81, 238.08, 240.4, 242.92, 245.22, 247.49, 249.82, 252.37, 255.06, 257.74, 260.45, 263.3, 266.05, 268.72, 271.53, 274.34, 276.97, 279.73, 282.5, 285.46, 288.24, 291.7, 294.89, 298.27, 301.79, 305.25, 308.73, 312.42, 316.0, 319.67, 323.11, 326.63, 330.43, 334.37, 338.23, 342.57, 347.15, 351.41, 355.66, 360.28, 364.98, 369.57, 374.53, 379.78, 384.58, 389.5, 394.35, 399.5, 404.76, 409.92, 415.44, 420.64, 426.47, 432.37, 438.16, 444.39, 451.63, 458.49, 463.87, 469.43, 475.0, 480.71, 487.03, 493.37, 499.0, 504.87, 511.18, 517.62, 524.36, 530.77, 537.73, 544.6, 550.98, 556.51, 562.59, 568.78, 575.47, 581.44, 587.47, 593.28, 599.59, 605.36, 611.19, 617.4, 623.71, 629.94, 636.64, 643.36, 650.05, 656.11, 663.35, 670.38, 677.93, 685.32, 692.8, 700.81, 709.38, 717.75, 725.46, 733.56, 741.95, 750.71, 759.58, 768.54, 778.66, 788.83, 798.29, 809.15, 819.95, 829.08, 840.42, 851.71, 863.29, 874.33, 885.05, 895.93, 906.74, 917.16, 928.65, 940.17, 950.46, 961.8, 974.01, 986.67, 1001.61, 1015.26, 1027.92, 1043.45, 1057.41, 1071.21, 1085.76, 1100.28, 1117.69, 1134.38, 1151.89, 1167.74, 1185.42, 1202.54, 1218.15, 1237.09, 1260.3, 1281.49, 1307.05, 1337.78, 1370.65, 1405.8, 1443.34, 1485.57, 1534.26, 1578.93, 1633.25, 1685.73, 1736.64, 1799.15, 1869.75, 1938.09, 2009.6, 2085.67, 2159.58, 2235.9, 2355.99, 2503.88, 2889.77], "left": -0.0004166182681528685}
