var cryptmessApp = {

    /** attributes **/
    pageCount: 0,
    pages: [],
    pageHistory: [],

    /** sub classes **/
    // Page sub class
    Page: {
        id: -1,
        name: "",
        active: false,

        // Initialization
        new: function(name, active) {
            var self = Object.create(this);

            self.id = self.pageCount++;
            self.name = name;
            self.active = active || false;
            return (self);
        },

        // Activates and shows page
        show: function() {
            document.getElementById(this.name).style.display = "";
            document.getElementById(this.name).style.visibility = "";
            this.active = true;
        },

        // Deactivates and hides page
        hide: function() {
            document.getElementById(this.name).style.display = "none";
            document.getElementById(this.name).style.visibility = "hidden";
            this.active = false;
        }
    },

    /** methods **/
    // Initialization
    init: function() {
//        this.hideUI();
        this.bindEvents();
        this.pages[
            this.Page.new("home", true),
            this.Page.new("decrypt"),
            this.Page.new("encrypt")
        ];
    },

    // Adds a page to the app
    addPage: function(name, active) {
        this.pages.push(this.Page.new(name, active));
    },

    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        var self = this;

        this.bindPageDecryptEvents();
        this.bindPageEncryptEvents();
        this.bindShowKeyButtonEvents();
        this.bindNavigatingEvents();
        this.bindHistoryEvents();
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },

    // Show key button behaviour
    bindShowKeyButtonEvents: function() {
        var showKeybutton = document.getElementsByClassName('showKey');
        var keyInput = document.getElementsByClassName('key');

        for (var i = 0; i < showKeybutton.length; i++) {
            showKeybutton.item(i).addEventListener('mousedown', function() {
                for (var j = 0; j < keyInput.length; j++) {
                    keyInput.item(j).setAttribute('type', "text");
                }
            });
            showKeybutton.item(i).addEventListener('mouseup', function() {
                for (var j = 0; j < keyInput.length; j++) {
                    keyInput.item(j).setAttribute('type', "password");
                }
            });
            showKeybutton.item(i).addEventListener('mouseleave', function() {
                for (var j = 0; j < keyInput.length; j++) {
                    keyInput.item(j).setAttribute('type', "password");
                }
            });
        }
    },

    // Page encrypt events
    bindPageEncryptEvents: function() {
        var self = this;
        var page = document.getElementById('page-encrypt');
        var encrypt = crypt.encrypt;

        page.getElementsByClassName('goCrypt')[0].addEventListener('click', function() {
            var message = page.getElementsByClassName('message')[0];
            var key = page.getElementsByClassName('key')[0];

            if (message.value.length <= 0) {
                // Error feedback empty message
                return (false);
            }
            if (key.value.length <= 0) {
                // Error feedback empty key
                return (false);
            }
            if (key.value.length > 25) {
                // Error feedback key too long
                return (false);
            }
            page.getElementsByClassName('cryptedMessage')[0].value = encrypt(key.value, message.value);
        });
    },

    // Page decrypt events
    bindPageDecryptEvents: function() {
        var self = this;
        var page = document.getElementById('page-decrypt');
        var decrypt = crypt.decrypt;

        page.getElementsByClassName('goDecrypt')[0].addEventListener('click', function() {
            var message = page.getElementsByClassName('cryptedMessage')[0];
            var key = page.getElementsByClassName('key')[0];

            if (message.value.length <= 0) {
                // Error feedback empty message
                return (false);
            }
            if (key.value.length <= 0) {
                // Error feedback empty key
                return (false);
            }
            if (key.value.length > 25) {
                // Error feedback key too long
                return (false);
            }
            page.getElementsByClassName('message')[0].value = decrypt(key.value, message.value);
        });
    },

    // Navigating events
    bindNavigatingEvents: function() {
        var self = this;
        var links = document.getElementsByTagName('a');

        this.initPages();
        // disables all click default behaviour on <a> tag
        for (var i = 0; i < links.length; i++) {
            links.item(i).addEventListener('click', function(evt) {
                self.navigate(evt.target.getAttribute('href').replace(/#/, ""));
                evt.preventDefault();
                return (false);
            });
        }
    },
    
    // History events
    bindHistoryEvents: function() {
        var self = this;
        
        document.getElementsByClassName('back-navigate')[0].addEventListener('click', function() {
            // .pop() returns the content of the poped element
            // here, the previous page name
            if (self.pageHistory.length > 1) {
                self.pageHistory.pop(); // pops the current page
                self.navigate(self.pageHistory.pop()); // pops previous page since navigate method will add it to history
            }
        });
    },

    // Initialize and indexes pages reading DOM
    initPages: function() {
        var pages = document.getElementsByClassName('page-content');

        for (var i = 0; i < pages.length; i++) {
            this.addPage(pages.item(i).id);
        }
        // Shows the first encountered page by default
        this.navigate(this.pages[0].name);
    },

    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
//        this.showUI();
//        app.receivedEvent('deviceready');
    },

    // Navigate through indexed pages
    navigate: function(pageName) {
        pageName = (pageName === "#") ? "page-home" : pageName;        
        for (var i = 0; i < this.pages.length; i++) {
            // Shows selected page then hides other
            if (pageName === this.pages[i].name) {
                this.pages[i].show();
                this.pageHistory.push(pageName);
            } else {
                this.pages[i].hide();
            }
        }
        this.update();
    },

    // Update DOM on a Received Event
    // Just for example, not used until then
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    },
    
    hideUI : function() {
        document.getElementsByTagName('body')[0].style.display = "none";
        document.getElementsByTagName('body')[0].style.visibility = "hidden";
    },
    
    showUI : function() {
        document.getElementsByTagName('body')[0].style.display = "";
        document.getElementsByTagName('body')[0].style.visibility = "";
    },
    
    // Updates ui elements
    update: function() {
        // Shows or hide the back navigating button
        if (this.pageHistory.length <= 1) {
            document.getElementsByClassName('back-navigate')[0].style.display = "none";
            document.getElementsByClassName('back-navigate')[0].style.visibility = "hidden";
        } else {
            document.getElementsByClassName('back-navigate')[0].style.display = "";
            document.getElementsByClassName('back-navigate')[0].style.visibility = "";
        }
    }
};

cryptmessApp.init();



//
//var app = {
//    // Application Constructor
//    initialize: function() {
//        this.bindEvents();
//    },
//    // Bind Event Listeners
//    //
//    // Bind any events that are required on startup. Common events are:
//    // 'load', 'deviceready', 'offline', and 'online'.
//    bindEvents: function() {
//        document.addEventListener('deviceready', this.onDeviceReady, false);
//    },
//    // deviceready Event Handler
//    //
//    // The scope of 'this' is the event. In order to call the 'receivedEvent'
//    // function, we must explicitly call 'app.receivedEvent(...);'
//    onDeviceReady: function() {
//        app.receivedEvent('deviceready');
//    },
//    // Update DOM on a Received Event
//    receivedEvent: function(id) {
//        var parentElement = document.getElementById(id);
//        var listeningElement = parentElement.querySelector('.listening');
//        var receivedElement = parentElement.querySelector('.received');
//
//        listeningElement.setAttribute('style', 'display:none;');
//        receivedElement.setAttribute('style', 'display:block;');
//
//        console.log('Received Event: ' + id);
//    }
//};
//
//app.initialize();