Bubbles.ObjectListener = {}

Bubbles.ObjectListener.click = function (event)
{
	for (var key in event.target.userData.events.onclick) {
		event.target.userData.actionTrigger.trigger(event.target.userData.events.onclick[key]);
	}
}

Bubbles.ObjectListener.over = function (event)
{
	for (var key in event.target.userData.events.onover) {
		event.target.userData.actionTrigger.trigger(event.target.userData.events.onover[key]);
	}
}

Bubbles.ObjectListener.out = function (event)
{
	for (var key in event.target.userData.events.onout) {
		event.target.userData.actionTrigger.trigger(event.target.userData.events.onout[key]);
	}
}

Bubbles.ObjectListener.down = function (event)
{
	for (var key in event.target.userData.events.ondown) {
		event.target.userData.actionTrigger.trigger(event.target.userData.events.ondown[key]);
	}
}

Bubbles.ObjectListener.up = function (event)
{
	for (var key in event.target.userData.events.onup) {
		event.target.userData.actionTrigger.trigger(event.target.userData.events.onup[key]);
	}
}