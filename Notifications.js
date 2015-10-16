var notificationTimeout;
function Notify(text)
{
	notificationarea.style.display = 'block';
	notificationarea.innerHTML = text;
  	notificationarea.style.left = window.innerWidth * 0.5 - notificationarea.offsetWidth * 0.5;
  	notificationarea.style.backgroundColor = notificationColorHalf;

	clearTimeout(notificationTimeout);

	notificationTimeout = setTimeout(ClearNotification, notificationDuration);
}

function NotificationEnter()
{
	clearTimeout(notificationTimeout);
  	notificationarea.style.backgroundColor = notificationColorFull;
}

function NotificationExit()
{
	ReshowLastNotification();
}

function ClearNotification()
{
	notificationarea.style.display = 'none';
}

function ReshowLastNotification()
{
	Notify(notificationarea.innerHTML);
}