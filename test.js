var ecs = require('./index');

var entities = [
	ecs.createEntity()
];

var components = ecs.createComponents({});

components.invokeForEachComponentAsync('load', [entities], function (error) {

	components.invokeForEachComponent('draw', [entities]);


	finish();

});


function finish () {
	console.log('ok');

	process.exit(0);
}
