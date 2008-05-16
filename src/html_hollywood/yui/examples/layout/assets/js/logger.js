(function() {
    var Dom = YAHOO.util.Dom,
        Event = YAHOO.util.Event;

    //Create this loader instance and ask for the Button module
    var loader = new YAHOO.util.YUILoader({
        base: '../../build/',
        require: ['logger'],
        onSuccess: function() {
            var r = YAHOO.example.app.layout.getUnitByPosition('right'),
            w = r.getSizes().body.w,
            h = r.getSizes().body.h;
            var logger = new YAHOO.widget.LogReader(r.body, {
                logReaderEnabled: true,
                draggable: false,
                footerEnabled: false,
                newestOnTop: true,
                height: h + 'px',
                width: w + 'px'
            });
            YAHOO.example.app.layout.on('resize', function() {
                var r = YAHOO.example.app.layout.getUnitByPosition('right'),
                w = r.getSizes().body.w,
                h = r.getSizes().body.h;
                Dom.setStyle(YAHOO.util.Selector.query('div.yui-log-bd', r.body), 'height', h + 'px');
            });
        }
    });
    //Call insert, only choosing the JS files, so the skin doesn't over write my custom css
    loader.insert({}, 'js');
})();
