var canvas = false;


// Instead of loading the TIF file into the browser
// an image is preprocessed. The image contains the 
// data for the height in the red component, and the
// gradient on the green and blue components

//(this is a quick-and-dirty way to get reasonably compressed
// data that's easily read by the browser)

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
	//document.getElementById('map_holder').appendChild(canvas)
	// update the drawing canvas size to match the data canvas.
	drawing_canvas = document.getElementById('drawing_canvas')
	drawing_canvas.width  = canvas.width
	drawing_canvas.height = canvas.height
}


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
	var method = document.getElementById('function_text').value
	var init_params = document.getElementById('params_text').value
	var p0 = [Number(document.getElementById('x').value),
			  Number(document.getElementById('y').value)]
	var iters = Number(document.getElementById('nits').value)
	var result = iterate(method,init_params, p0, iters)
	draw_lines(result)
}

	function draw_lines(coords){

		var ctx = drawing_canvas.getContext('2d');
		ctx.lineWidth = 5
		ctx.strokeStyle="#000000";
		var [x,y] = coords[0];
		ctx.beginPath();
		ctx.moveTo(x,y);
		for(var i=1; i<coords.length; i++){
			var [x,y] = coords[i];
			ctx.lineTo(x,y)
		}
		ctx.stroke()
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

function load_method(name){
	document.getElementById('function_text').value = methods[name].function
	document.getElementById('params_text').value = methods[name].init_params
}


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
var translator = {"right": 5.000416715065181, "bottom": 39.999583575446934, "top": 45.00041690878027, "gy": [-531.76, -33.34, -28.21, -24.76, -22.37, -20.41, -18.88, -17.56, -16.4, -15.44, -14.54, -13.71, -12.87, -12.17, -11.49, -10.84, -10.27, -9.76, -9.3, -8.87, -8.46, -8.11, -7.79, -7.49, -7.19, -6.9, -6.64, -6.39, -6.16, -5.95, -5.74, -5.54, -5.33, -5.13, -4.96, -4.79, -4.64, -4.5, -4.36, -4.23, -4.1, -3.98, -3.86, -3.76, -3.65, -3.55, -3.46, -3.37, -3.28, -3.19, -3.11, -3.03, -2.95, -2.88, -2.8, -2.74, -2.67, -2.6, -2.54, -2.48, -2.42, -2.36, -2.3, -2.23, -2.18, -2.12, -2.07, -2.02, -1.97, -1.92, -1.87, -1.83, -1.78, -1.74, -1.69, -1.65, -1.61, -1.57, -1.52, -1.48, -1.44, -1.4, -1.37, -1.33, -1.29, -1.25, -1.22, -1.18, -1.14, -1.11, -1.07, -1.03, -1.0, -0.96, -0.93, -0.89, -0.86, -0.82, -0.79, -0.76, -0.73, -0.7, -0.66, -0.63, -0.6, -0.57, -0.55, -0.52, -0.49, -0.47, -0.44, -0.41, -0.39, -0.36, -0.34, -0.31, -0.29, -0.27, -0.25, -0.22, -0.2, -0.18, -0.16, -0.14, -0.12, -0.1, -0.08, -0.07, -0.05, -0.04, -0.03, -0.01, -0.0, 0.0, 0.01, 0.02, 0.03, 0.04, 0.06, 0.07, 0.09, 0.1, 0.12, 0.14, 0.15, 0.17, 0.19, 0.21, 0.23, 0.25, 0.27, 0.29, 0.32, 0.34, 0.36, 0.39, 0.41, 0.44, 0.46, 0.48, 0.51, 0.53, 0.56, 0.59, 0.62, 0.65, 0.68, 0.71, 0.74, 0.77, 0.8, 0.83, 0.87, 0.9, 0.94, 0.98, 1.02, 1.05, 1.09, 1.13, 1.17, 1.21, 1.25, 1.29, 1.34, 1.38, 1.43, 1.48, 1.53, 1.57, 1.62, 1.67, 1.72, 1.78, 1.83, 1.88, 1.93, 1.99, 2.05, 2.1, 2.17, 2.23, 2.29, 2.36, 2.42, 2.49, 2.56, 2.64, 2.72, 2.8, 2.89, 2.98, 3.07, 3.16, 3.25, 3.35, 3.46, 3.57, 3.69, 3.8, 3.94, 4.07, 4.21, 4.36, 4.53, 4.7, 4.87, 5.06, 5.26, 5.48, 5.71, 5.95, 6.2, 6.48, 6.78, 7.11, 7.45, 7.82, 8.25, 8.68, 9.16, 9.69, 10.27, 10.9, 11.57, 12.31, 13.15, 14.11, 15.07, 16.16, 17.49, 19.21, 21.51, 24.11, 28.6, 1001.59], "gx": [-523.96, -26.27, -21.22, -18.12, -16.01, -14.46, -13.27, -12.24, -11.34, -10.63, -9.98, -9.45, -8.95, -8.49, -8.08, -7.68, -7.32, -6.98, -6.68, -6.4, -6.13, -5.87, -5.63, -5.41, -5.2, -5.0, -4.82, -4.64, -4.47, -4.32, -4.17, -4.02, -3.89, -3.76, -3.63, -3.51, -3.4, -3.29, -3.18, -3.08, -2.98, -2.89, -2.81, -2.73, -2.66, -2.58, -2.51, -2.45, -2.39, -2.33, -2.27, -2.21, -2.15, -2.1, -2.04, -1.99, -1.94, -1.89, -1.84, -1.8, -1.75, -1.71, -1.67, -1.62, -1.58, -1.54, -1.5, -1.47, -1.43, -1.39, -1.36, -1.32, -1.28, -1.25, -1.22, -1.18, -1.15, -1.12, -1.08, -1.05, -1.02, -0.99, -0.96, -0.93, -0.9, -0.87, -0.84, -0.81, -0.78, -0.76, -0.73, -0.7, -0.68, -0.65, -0.63, -0.6, -0.58, -0.56, -0.53, -0.51, -0.49, -0.47, -0.44, -0.42, -0.4, -0.38, -0.35, -0.33, -0.31, -0.29, -0.27, -0.25, -0.23, -0.21, -0.19, -0.17, -0.16, -0.14, -0.12, -0.11, -0.09, -0.08, -0.06, -0.05, -0.04, -0.03, -0.02, -0.01, 0.0, 0.0, 0.01, 0.02, 0.03, 0.04, 0.05, 0.07, 0.08, 0.09, 0.11, 0.12, 0.14, 0.16, 0.17, 0.19, 0.2, 0.22, 0.24, 0.26, 0.28, 0.3, 0.31, 0.33, 0.36, 0.38, 0.4, 0.42, 0.44, 0.46, 0.48, 0.51, 0.53, 0.56, 0.58, 0.61, 0.63, 0.66, 0.68, 0.71, 0.73, 0.76, 0.79, 0.81, 0.84, 0.87, 0.9, 0.93, 0.96, 0.99, 1.02, 1.05, 1.08, 1.11, 1.14, 1.18, 1.21, 1.24, 1.28, 1.31, 1.34, 1.38, 1.42, 1.45, 1.49, 1.53, 1.57, 1.61, 1.65, 1.7, 1.74, 1.78, 1.83, 1.88, 1.92, 1.97, 2.02, 2.07, 2.13, 2.18, 2.24, 2.3, 2.36, 2.41, 2.48, 2.55, 2.62, 2.7, 2.78, 2.86, 2.95, 3.04, 3.13, 3.23, 3.34, 3.44, 3.55, 3.67, 3.79, 3.91, 4.05, 4.21, 4.37, 4.54, 4.72, 4.9, 5.11, 5.33, 5.56, 5.83, 6.1, 6.4, 6.74, 7.1, 7.51, 8.0, 8.53, 9.14, 9.86, 10.68, 11.63, 12.87, 14.23, 15.78, 17.84, 20.59, 25.16, 520.05], "height": [-1000.0, -2.0, -0.56, 0.34, 1.32, 3.04, 5.42, 8.63, 12.49, 17.43, 22.47, 27.64, 30.9, 33.96, 38.18, 42.15, 45.57, 49.03, 52.72, 56.16, 59.64, 63.06, 66.64, 70.35, 73.47, 76.83, 80.02, 83.55, 86.62, 89.84, 92.52, 95.08, 97.74, 100.29, 102.81, 105.66, 108.7, 111.41, 113.74, 115.98, 118.25, 120.58, 122.97, 125.21, 127.39, 129.6, 131.77, 133.78, 135.78, 137.91, 140.11, 142.3, 144.3, 146.42, 148.31, 150.09, 152.06, 154.02, 156.08, 157.9, 159.76, 161.92, 164.19, 166.45, 168.59, 170.88, 173.0, 175.34, 177.38, 179.54, 181.76, 183.93, 186.3, 188.31, 190.32, 192.35, 194.35, 196.41, 198.54, 200.72, 203.01, 205.09, 207.46, 209.69, 212.01, 214.45, 216.87, 219.22, 221.54, 223.92, 226.35, 228.79, 231.08, 233.38, 235.44, 237.76, 240.03, 242.63, 244.96, 247.2, 249.52, 252.11, 254.76, 257.52, 260.22, 263.12, 265.89, 268.57, 271.33, 274.21, 276.86, 279.63, 282.4, 285.41, 288.21, 291.68, 294.9, 298.3, 301.88, 305.34, 308.9, 312.57, 316.19, 319.84, 323.27, 326.86, 330.72, 334.72, 338.54, 342.96, 347.53, 351.87, 356.14, 360.88, 365.7, 370.27, 375.26, 380.56, 385.44, 390.36, 395.17, 400.6, 405.59, 410.98, 416.4, 421.93, 427.7, 433.59, 439.55, 446.12, 453.31, 459.88, 465.33, 471.1, 476.48, 482.42, 488.98, 495.15, 500.65, 506.8, 513.17, 519.71, 526.62, 533.23, 540.17, 547.14, 553.04, 558.77, 565.05, 571.38, 577.74, 583.82, 589.8, 595.94, 602.04, 607.71, 613.65, 620.05, 626.45, 633.06, 639.82, 646.61, 653.01, 659.64, 666.74, 674.39, 681.79, 689.12, 697.03, 705.13, 713.97, 721.86, 729.69, 738.31, 746.9, 755.93, 764.63, 774.59, 784.66, 794.41, 805.09, 815.75, 825.41, 836.07, 847.43, 859.32, 870.41, 881.18, 892.12, 903.53, 913.34, 924.9, 936.76, 947.43, 958.5, 970.54, 983.27, 997.74, 1011.64, 1024.61, 1039.77, 1054.09, 1067.44, 1082.75, 1096.45, 1113.71, 1131.18, 1148.34, 1164.23, 1181.74, 1199.61, 1215.09, 1234.31, 1256.2, 1278.74, 1303.77, 1332.64, 1366.32, 1401.48, 1438.35, 1480.05, 1530.71, 1574.43, 1627.53, 1681.5, 1733.01, 1794.19, 1864.67, 1934.75, 2006.33, 2082.61, 2157.75, 2235.03, 2354.29, 2502.99, 2889.75], "left": -0.0004166182681528685}
