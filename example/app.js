import HuaweiAnalytics from 'huawei.analytics';

var win = Ti.UI.createWindow();
win.addEventListener('open', init);

var btn = Ti.UI.createButton({ title: 'Log event' });
btn.addEventListener('click', logEvent);

win.add(btn);
win.open();

function init() {
    HuaweiAnalytics.configure();
}

function logEvent() {
    HuaweiAnalytics.log('my_event', { value: 123 });
}