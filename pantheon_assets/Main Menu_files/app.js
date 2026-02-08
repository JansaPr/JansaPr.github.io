var appVersion = 1009;

// Fonction qui permet de récupérer la longueur d'un objet, meme si ses clés sont autre que numérique
Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

angular.module('MBP', ['ionic', 'ngStorage', 'pascalprecht.translate'])

.service('Popup', function($ionicPopup) {
    
    this.simple = function(title, subtitle) {
        var simplePopup = $ionicPopup.show({
            template: '',
            title: title,
            subTitle: subtitle,
            buttons: [
                {
                    text: '<b>Ok</b>',
                    type: 'button-positive'
                }
            ]
        });
    };
    
})


.service('Platform', function() {
	
	this.deviceInfo = function() {
		return ionic.Platform.device();
	}
	
	this.isBrowser = function() {
		if(ionic.Platform.platforms[0] == "browser") {
			return true;
		}
		else {
			return false;
		}
	}
	
	this.isWebView = function() {
		return ionic.Platform.isWebView();
	}
	
	this.isIPad = function() {
		return ionic.Platform.isIPad();
	}
	
	this.isIOS = function() {
		return ionic.Platform.isIOS();
	}
	
	this.isAndroid = function() {
		return ionic.Platform.isAndroid();
	}
	
	this.isWindowsPhone = function() {
		return ionic.Platform.isWindowsPhone();
	}
	
	this.getPlatform = function() {
		return ionic.Platform.platform();
	}
	
	this.getVersion = function() {
		return ionic.Platform.version();
	}
	
	this.exitApp = function() {
		ionic.Platform.exitApp();
	}
	
})


// Isotope exécuté avec jquery a besoin d'attendre que le ng-repeat d'angular soit terminé 
// pour être éxécuté alors on le sort du controller pour pouvoir le lancer avec un timeout
.service('Isotope', function() {
    
    var isoGrid = [];
    var collection = new Array();
    var qsRegex = [];
    var buttonFilter = [];
    var iso_filters = new Array();
    var isCheckingDOM = [];
    // Permet de savoir combien d'éléments ont été reconnu par isotope pour savoir quand le relancer quand il y a eu des modifications dans le DOM
    var isotopeDOMElements = [];
    // Permet de retrouver le container des filtres par le nom de la variable isotope
    var isoFilterContainer = [];
    var isoFilterName = [];
    
    var isotopeIsRunning = [];
    var itemsHaveBeenAdded = [];
    
    // debounce so filtering doesn't happen every millisecond
    function debounce( fn, threshold ) {
        var timeout;
        return function debounced() {
            if ( timeout ) {
              clearTimeout( timeout );
            }
            function delayed() {
              fn();
              timeout = null;
            }
            setTimeout( delayed, threshold || 100 );
        };
    }
    
    this.init = function(container, isoName) {
        
        isoFilterContainer[isoName] = container + '_filters';
        isoFilterName[container + '_filters'] = isoName;
        
        // init Isotope
        isoGrid[isoName] = $('#' + container).isotope({
            itemSelector: '.card',
            layoutMode: 'fitRows',
            sortBy: 'unit_name',
            fitRows: {
              gutter: 0
            },
            onLayout: function() {
                ///$scope.setFilteredCards($('#isotopeContainer .card:not(.isotope-hidden)').length  - $scope.collection.length);
            },
            filter: function() {
                var $this = $(this);
                var searchResult = qsRegex[isoName] ? $this.text().match( qsRegex[isoName] ) : true;
                var buttonResult = buttonFilter[isoName] ? $this.is( buttonFilter[isoName] ) : true;
                
                var numItems = $('#'+ container +' .card:not(.isotope-hidden)').length - collection.length;
                if (numItems === 0) {
                    $('.isotope-error-box').show();
                } else {
                    $('.isotope-error-box').hide();
                }
                return searchResult && buttonResult;
            },
            getSortData: {
            	unit_name: function( itemElem ) { // function
            				var unit_name = $( itemElem ).find('.unit_name').text();
            				return unit_name.toLowerCase().replace(/[èéêëe]/g, "e ").replace(/[çc]/g, "c ").replace(/[àáâäa]/g, "a ").replace(/[ïîíi]/g, "i ").replace(/[ûùüu]/g, "u ").replace(/[ôöóo]/g, "o ");
                  		}, 
                melee: function( itemElem ) { // function
                          var melee = $( itemElem ).find('.melee').text();
                          return parseFloat( melee.replace( /[\(\)]/g, '') );
                        }, 
                defense: function( itemElem ) { // function
                          var defense = $( itemElem ).find('.defense').text();
                          return parseFloat( defense.replace( /[\(\)]/g, '') );
                        },
                ranged: function( itemElem ) { // function
                          var ranged = $( itemElem ).find('.ranged').text();
                          return parseFloat( ranged.replace( /[\(\)]/g, '') );
                        },
                speed: function( itemElem ) { // function
                          var speed = $( itemElem ).find('.speed').text();
                          return parseFloat( speed.replace( /[\(\)]/g, '') );
                        },
                health: function( itemElem ) { // function
                          var health = $( itemElem ).find('.health').text();
                          return parseFloat( health.replace( /[\(\)]/g, '') );
                        },
                rc: function( itemElem ) { // function
                            var rc = $( itemElem ).find('.rc').text();
                            return parseFloat( rc.replace( /[\(\)]/g, '') );
                          },
                ac: function( itemElem ) { // function
                              var ac = $( itemElem ).find('.ac').text();
                              return parseFloat( ac.replace( /[\(\)]/g, '') );
                            },
                aow: function( itemElem ) { // function
                                var aow = $( itemElem ).find('.aow').text();
                                return parseFloat( aow.replace( /[\(\)]/g, '') );
                              }
            }
        });
        
        // En relançant isotope une deuxième fois, on s'assure que tous les items sont bien placés
        isoGrid[isoName].isotope();
          
        // On s'assure que toutes les images sont chargées
        isoGrid[isoName].imagesLoaded().progress( function() {
        	//isoGrid[isoName].isotope('layout');
            isoGrid[isoName].isotope();
    	});
        
    };
    
    this.initInteractions = function(isoName) {

        // use value of search field to filter
        var $quicksearch = $('#'+ isoFilterContainer[isoName] + ' .quicksearch').keyup( debounce( function() {
            qsRegex[isoName] = new RegExp( $quicksearch.val(), 'gi' );
            isoGrid[isoName].isotope();
        }) );
        
        $('.list_filters select.filter').on('change', function() {
            var parent = $(this).parents('.list_filters');
            var thisID = $(this).attr('id');
            var filterID = $(this).parents('.filters_container').attr('id');
            if(iso_filters[isoFilterName[filterID]] == undefined) {
                iso_filters[isoFilterName[filterID]] = new Array();
            }
            if(iso_filters[isoFilterName[filterID]][thisID] == undefined) {
                iso_filters[isoFilterName[filterID]][thisID] = new Array();    
            }
            else {
                for(var prop in iso_filters[isoFilterName[filterID]][thisID]) {
                    iso_filters[isoFilterName[filterID]][thisID][prop] = false;
                }
            }
            iso_filters[isoFilterName[filterID]][thisID][$(parent).find('select#'+thisID).val()] = true;
            setFilters(isoFilterName[filterID]);
        });
        
        $('.list_filters select.sortby, .list_filters select.sortbyorder').on('change', function() {
            var ascending = false;
            var parent = $(this).parents('.list_filters');
            if($(parent).find('select.sortbyorder').val() == 'ascending') {
                ascending = true;  
            }
            else {
               ascending = false; 
            }
            isoGrid[isoName].isotope({ sortBy: $(parent).find('select.sortby').val(), sortAscending: ascending });
        });

        function setFilters(isoName) {
            var tempQuery = '';
            var excludeClass = '';
            for(var j in iso_filters[isoName]) {
                for(var k in iso_filters[isoName][j]) {
                    if(iso_filters[isoName][j][k]) {
                        tempQuery = tempQuery + k;
                    }
                }
            }
            buttonFilter[isoName] = tempQuery + excludeClass;
            isoGrid[isoName].isotope();
        }
 
    };
    
    var localRebuild = function(isoName) {
        isoGrid[isoName].isotope('reloadItems').isotope();
        // En relançant isotope une deuxième fois, on s'assure que tous les items sont bien placés
        isoGrid[isoName].isotope();
        // On s'assure que toutes les images sont chargées
        isoGrid[isoName].imagesLoaded().progress( function() {
        	//isoGrid[isoName].isotope('layout');
            isoGrid[isoName].isotope();
    	});
    }
    
    this.getIsotope = function(isoName) {
    	return isoGrid[isoName];
    }
    
    this.reLayout = function(isoName) {
    	isoGrid[isoName].isotope('layout');
    }
    
    this.rebuild = function(isoName) {
        localRebuild(isoName);
    }
    
    this.setDOMElements = function(isoName, num) {
        isotopeDOMElements[isoName] = num;
    }
    
    this.setIsotopeIsRunning = function(isoName, state) {
        isotopeIsRunning[isoName] = state;
    }
    
    this.getIsotopeIsRunning = function(isoName) {
        return isotopeIsRunning[isoName];
    }
    
    this.setItemsHaveBeenAdded = function(isoName) {
        itemsHaveBeenAdded[isoName] = true;
    }
    
    this.getItemsHaveBeenAdded = function(isoName) {
        return itemsHaveBeenAdded[isoName];
    }
    
    var localCheckIsotopeItemsAddedInDOM = function(container, isoName) {
        isCheckingDOM[isoName] = true;
        if( $('#'+container).length ) {
            if(itemsHaveBeenAdded[isoName]) {
                if( $('#'+container+' .elem').length != isotopeDOMElements[isoName]) {
                    isotopeDOMElements[isoName] = $('#'+container+' .elem').length;
                    localRebuild(isoName);
                    itemsHaveBeenAdded[isoName] = false;
                    isCheckingDOM[isoName] = false;
                    return;
                }
                else {
                    setTimeout( function() { localCheckIsotopeItemsAddedInDOM(container, isoName); }, 100 );
                }
            }
            else {
                isCheckingDOM[isoName] = false;
                return;
            }
        }
        else {
            setTimeout( function() { localCheckIsotopeItemsAddedInDOM(container, isoName); }, 100 );
        }
    }
    
    this.checkIsotopeItemsAddedInDOM = function(container, isoName) {
        localCheckIsotopeItemsAddedInDOM(container, isoName);
    }
    
    this.canYouLaunch = function(isoContainer, isoName) {
        if(!isCheckingDOM[isoName]) {
            localCheckIsotopeItemsAddedInDOM(isoContainer, isoName); 
        }    
    }     
    
    
})

// Cette directive check si tous les éléments du ng-repeat d'angular sont traités
// Si c'est le cas, on peut éxécuter isotope avec jquery
.directive('onFinishRender', function ($timeout) {
    return {
        restrict: 'A',
        link: function (scope, element, attr) {
            if (scope.$last === true) {
                $timeout(function () {
                    scope.$emit(attr.onFinishRender);
                });
            }
        }
    }
})

// Filtre permettant de faire un order by avec l'attribut d'un objet
.filter('orderObjectBy', function(){
    return function(input, attribute) {
        if (!angular.isObject(input)) return input;

        var array = [];
        for(var objectKey in input) {
            array.push(input[objectKey]);
        }

        array.sort(function(a, b){
            var alc = a[attribute].toLowerCase(),
                blc = b[attribute].toLowerCase();
            return alc > blc ? 1 : alc < blc ? -1 : 0;
        });
        return array;
    }
})

// Filtre permettant de faire un order by avec l'attribut d'un objet qui est un entier 
.filter('orderObjectByInt', function(){
    return function(input, attribute) {
        if (!angular.isObject(input)) return input;

        var array = [];
        for(var objectKey in input) {
            array.push(input[objectKey]);
        }

        array.sort(function(a, b){
            a = parseInt(a[attribute]);
            b = parseInt(b[attribute]);
            return a - b;
        });
        return array;
    }
})

// Filtre permettant de faire des ng-repeat avec un nombre max plutot qu'en parsant un tableau (exemple : ng-repeat="n in [] | range:100")
.filter('range', function() {
    return function(input, total) {
        total = parseInt(total);
        for (var i=0; i<total; i++) {
          input.push(i);
        }
        return input;
    };
})

.run(function($ionicPlatform, $rootScope) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
    // Désactive l'utilisation du bouton précédent du hardware
    $ionicPlatform.onHardwareBackButton(function (event) {
        event.preventDefault();
        event.stopPropagation();
    });
  });
})

.controller('MainCtrl', function($rootScope, $scope, $http, $sce, $state, $ionicSideMenuDelegate, $localStorage, Isotope, preloader, Platform, $ionicPopup, $filter, $translate) {
    
    var self = this;
    // Objet qui contient toutes les unités du jeu. Utile pour récupérer des infos sur celles-ci de n'importe où
    $rootScope.unitsDB = {};
    // Mémorise les joueurs entrés par l'utilisateur
    $rootScope.players = [];
    // Pourcentage de chargement des images
    $scope.percentLoaded = 0;
    // Montre ou cache le loader de l'app
    $scope.displayApp = false;
    // Définit la langue actuelle de l'app, seulement pour les textes des unités, etc. (tout ce qui a rapport au jeu)
    $rootScope.language = 'en';
    // Définit la langue choisie pour l'interface de l'app
    $rootScope.ui_language = 'en';
    // Stocke tous les noms des talents et leurs descriptions dans les différentes langues
    $rootScope.talents = {};
    // Contiendra tous les sets venant du XML (core box, extensions, etc.)
    $scope.sets = {};
    // Contiendra tous les noms "lisibles" des extensions récupérés à partir des codes d'extension des attributs des unités ("core", "ks", "oedipus", etc.)
    $scope.setsName = {};
    // Contiendra la vraie collection de l'utilisateur, après être passé par le formulaire de sélection des items de collection
    $scope.collection = {}; 
    /*$scope.collection = {'test' : 'ok'};*/ // Pour la prod
    // Contiendra le compte des unités que le joueur possède par set (core box, extension, etc.).
    // Sert surtout à savoir si la checkbox d'un set est cochée ou non dans les templates de la gestion des collections
    $scope.set_collection_count = {};
    // Permet à la page collection de savoir si l'utilsateur possède toute la collection
    $scope.iReallyOwnEverything = false; // :(
    // Définit les étapes du game manager quand une session a été commencée. Possibles : "none", "gods_picks", "bans", "units_picks"
    $rootScope.gameManagerStep = 'none';
    // Détermine le type de partie lancée. Deux choix possibles : "normal" ou "custom"
    $rootScope.gameMode = 'normal';
    // Liste des unités qui seront ajoutées à la selection et sélectionnables par les joueurs après etre passée au randomizer (ou pas)
    $rootScope.enabledPicksList = {};
    // Liste temporaire des unités. Montrées pour facilité la sélection des Dieux
    $rootScope.temporaryPicksList = {};
    // Liste des picks qui ne sont plus disponibles parce que déjà pris ou bannis. Si le pick n'est pas dispo, la valeur est true
    $rootScope.unavailablePicks = {};
    // Pour savoir si l'utilisateur a déjà vu la popup avertissant que l'application tourne essentiellement sur android.
    // True, s'il ne faut plus la montrer
    $scope.advertisePopup = false;
    // Seed utilisée pour la fonction Math.random
    $rootScope.seed = '';
    // Afficher les règles Nemesis ou non
    $rootScope.nemesis_mode = true
    // App Version
    $scope.appVersion = appVersion
    
    // Pour la prod seulement : vide le localStorage
	//    delete $localStorage.collection;
	//    delete $localStorage.set_collection_count;
    //    delete $localStorage.sets;
    
    // Charge les données de l'app
    var loadXML = function() {
        $http.get("data/index.php?ver=" + appVersion,
        {
            transformResponse: function (cnv) {
                var x2js = new X2JS({enableToStringFunc : false});
                var aftCnv = x2js.xml_str2json(cnv);
                return aftCnv;
            }
        })
        .success(function (response) {
            self.units = response.mb.units.unit;
            self.sets = response.mb.database.sets.set;
            self.talents = response.mb.database.talents.talent;
            // On peuple l'objet des correspondances "code"/"nom réel" des extensions
            for(var i = 0, arrLen = self.sets.length; i < arrLen; i++) {
                $scope.setsName[self.sets[i]['_code']] = self.sets[i];
            }
            // On peuple l'objet contenant les talents
            for(var i = 0, arrLen = self.talents.length; i < arrLen; i++) {
                $scope.talents[self.talents[i]['_code']] = self.talents[i];
            }
            // On définit un tableau nommé "sets" contenant tous les sets (core box, extensions, stretch goals, etc.)
            // On classe toutes les unités par set dans un tableau bi-dimensionnel
            // On définit également les entrées pour set_collection_count (voir plus haut)
            // Peuple également unitsDB
            for(var i = 0, arrLen = self.units.length; i < arrLen; i++) {
                if(self.units[i]['_set'] in $scope.sets) {
                    $scope.sets[self.units[i]['_set']].push({'data' : self.units[i], 'incollection' : false});
                }
                else {
                    $scope.sets[self.units[i]['_set']] = new Array({'data' : self.units[i], 'incollection' : false});
                    $scope.set_collection_count[self.units[i]['_set']] = 0;
                }
                // On peuple l'objet unitsDB qui servira à récup des infos sur les unités de partout dans l'appli
                $rootScope.unitsDB[self.units[i]['_id']] = self.units[i]; 
            }
            // Récupère les variables et les objets dans le localStorage s'il y en a
            if (typeof(Storage) !== "undefined") {
	            if($localStorage.collection !== undefined && $localStorage.collection !== 'undefined') {
	            	$scope.collection = $localStorage.collection;
	            }
	            if($localStorage.set_collection_count !== undefined && $localStorage.set_collection_count !== 'undefined') {
	            	$scope.set_collection_count = $localStorage.set_collection_count;
	            }
	            if($localStorage.sets !== undefined && $localStorage.sets !== 'undefined') {
	            	$scope.sets = $localStorage.sets;
	            }
	            if($localStorage.players !== undefined && $localStorage.players !== 'undefined') {
	            	$rootScope.players = $localStorage.players;
	            }
	            if($localStorage.gameMode !== undefined && $localStorage.gameMode !== 'undefined') {
	            	$rootScope.gameMode = $localStorage.gameMode;
	            }
	            if($localStorage.gameManagerStep !== undefined && $localStorage.gameManagerStep !== 'undefined') {
	            	$rootScope.gameManagerStep = $localStorage.gameManagerStep;
	            }
	            if($localStorage.advertisePopup !== undefined && $localStorage.advertisePopup !== 'undefined') {
	            	$scope.advertisePopup = $localStorage.advertisePopup;
	            }
                if($localStorage.nemesis_mode !== undefined && $localStorage.nemesis_mode !== 'undefined') {
                    $rootScope.nemesis_mode = $localStorage.nemesis_mode;
                }
	            if($localStorage.ui_language !== undefined && $localStorage.ui_language !== 'undefined') {
	            	$rootScope.ui_language = $localStorage.ui_language;
	            	$translate.use($rootScope.ui_language);
	            }
	            else {
	            	if(navigator.language == 'fr') {
	            		$rootScope.ui_language = 'fr';
	            		$localStorage.ui_language = 'fr';
	            		$translate.use('fr');
	            	}
	            	else if (navigator.language == 'es') {
	            		$rootScope.ui_language = 'es';
	            		$localStorage.ui_language = 'es';
	            		$translate.use('es');
	            	}
	            	else {
	            		$rootScope.ui_language = 'en';
	            		$localStorage.ui_language = 'en';
	            		$translate.use('en');
	            	}
	            }
	            if($localStorage.language !== undefined && $localStorage.language !== 'undefined') {
	            	$rootScope.language = $localStorage.language;
	            }
	            else {
	            	if(navigator.language == 'fr') {
	            		$rootScope.language = 'fr';
	            		$localStorage.language = 'fr';
	            	}
	            	else if (navigator.language == 'es') {
	            		$rootScope.language = 'es';
	            		$localStorage.language = 'es';
	            	}
	            	else {
	            		$rootScope.language = 'en';
	            		$localStorage.language = 'en';
	            	}
	            }
	            if($localStorage.appversion == undefined || $localStorage.appversion == 'undefined') {
	            	delete $localStorage.collection;
	            	delete $localStorage.set_collection_count;
	                delete $localStorage.sets;
	                delete $localStorage.players;
	            	delete $localStorage.gameMode;
	            	delete $localStorage.gameManagerStep;
	            	delete $localStorage.advertisePopup;
                    delete $localStorage.nemesis_mode;
	            	$localStorage.appversion = appVersion;
	            }
	            else {
	            	if($localStorage.appversion != appVersion) {
	            		// C'est ici qu'on fait les actions selon la version de l'application
                        delete $localStorage.collection;
                        delete $localStorage.set_collection_count;
                        delete $localStorage.sets;
                        delete $localStorage.players;
                        delete $localStorage.gameMode;
                        delete $localStorage.gameManagerStep;
                        delete $localStorage.advertisePopup;
                        delete $localStorage.nemesis_mode;
                        delete $localStorage.appversion;
                        location.reload();
	            	}
	            }
            }
            // on vérifie que le device est bien pret pour montrer une popup d'avertissement
            ionic.Platform.ready(function(){
        		if(ionic.Platform.platforms[0] == 'browser' && $scope.advertisePopup == false) {
        			var myAdvertisePopup = $ionicPopup.show({
        	            template: 'Still looking for Mythic Battles Ragnarok placards and cards to add the units in the app. <br /><br />If you want to help me add Ragnarok stuff in the app, send an email at bdasilva.dev@gmail.com.<br /><br />8 years later, the app is still up and running ! If you appreciate my work, consider offering me a coffee <a target="_blank" href="https://buymeacoffee.com/bdasilva">here</a>. Any support is greatly appreciated !<br /><br />Thanks !',
        	            title: 'Hey !',
        	            subTitle: '',
        	            buttons: [
        	            	{
        	                    text: "Do not show again",
        	                    onTap: function(e) {
        	                    	$scope.advertisePopup = true;
        	                    	$localStorage.advertisePopup = true;
        	                    }
        	                },
        	                {
        	                    text: '<b>Ok</b>',
        	                    type: 'button-positive'
        	                }
        	            ]
        	        });
        		}
        	});
            $scope.displayApp = true;
        });
    }
    
    // On preload d'abord les images et les fonts essentielles à l'affichage de l'appli avant de demander le chargement du xml
    $scope.imageLocations = [
        'img/texture_mur.jpg',
        'img/geom_r.png',
        'img/texture_mur_grey2.png',
        'img/greek_column2.png',
        'img/texture_mur_grey.png',
        'img/boxes/core_box.png',
        'img/boxes/exp_corinthia.png',
        'img/boxes/exp_echidna.png',
        'img/boxes/exp_helljudges.png',
        'img/boxes/exp_hephaestus.png',
        'img/boxes/exp_hera.png',
        'img/boxes/exp_manticore.png',
        'img/boxes/exp_oedipus.png',
        'img/boxes/exp_poseidon.png',
        'img/boxes/exp_titans.png',
        'img/boxes/exp_trojan.png',
        'img/boxes/pandora_box.png',
        'img/portraits/achilles.jpg',
        'img/portraits/amazons.jpg',
        'img/portraits/apollo.jpg',
        'img/portraits/ares.jpg',
        'img/portraits/atalanta.jpg',
        'img/portraits/athena.jpg',
        'img/portraits/centaurs.jpg',
        'img/portraits/cerberus.jpg',
        'img/portraits/hades.jpg',
        'img/portraits/hellhound.jpg',
        'img/portraits/hellwarrior.jpg',
        'img/portraits/heracles.jpg',
        'img/portraits/hoplites.jpg',
        'img/portraits/hydra.jpg',
        'img/portraits/leonidas.jpg',
        'img/portraits/medusa.jpg',
        'img/portraits/minotaur.jpg',
        'img/portraits/odysseus.jpg',
        'img/portraits/oedipus.jpg',
        'img/portraits/prometheus.jpg',
        'img/portraits/spartans.jpg',
        'img/portraits/sphynx.jpg',
        'img/portraits/zeus.jpg',
        'img/portraits/dionysus.png',
        'img/portraits/satyr_children.png',
        'img/portraits/ymir.png',
        'img/portraits/20161213/aphrodite.jpg',
        'img/portraits/20161213/artemis.jpg',
        'img/portraits/20161213/atlas.jpg',
        'img/portraits/20161213/enceladus.jpg',
        'img/portraits/20161213/gaia.jpg',
        'img/portraits/20161213/hecate.jpg',
        'img/portraits/20161213/helios.jpg',
        'img/portraits/20161213/hephaestus.jpg',
        'img/portraits/20161213/hera.jpg',
        'img/portraits/20161213/hermes.jpg',
        'img/portraits/20161213/kronos.jpg',
        'img/portraits/20161213/pan.jpg',
        'img/portraits/20161213/persephone.jpg',
        'img/portraits/20161213/poseidon.jpg',
        'img/portraits/20161213/typhon.jpg',
        'img/portraits/20161214/achilles_exp.jpg',
        'img/portraits/20161214/aeacus.jpg',
        'img/portraits/20161214/aegisthus.jpg',
        'img/portraits/20161214/agamemnon.jpg',
        'img/portraits/20161214/ajax.jpg',
        'img/portraits/20161214/andromeda.jpg',
        'img/portraits/20161214/autolycus.jpg',
        'img/portraits/20161214/bellerophon.jpg',
        'img/portraits/20161214/cecrops.jpg',
        'img/portraits/20161214/chiron.jpg',
        'img/portraits/20161214/circe.jpg',
        'img/portraits/20161214/diomedes.jpg',
        'img/portraits/20161214/echo.jpg',
        'img/portraits/20161214/eurystheus.jpg',
        'img/portraits/20161214/eurytion.jpg',
        'img/portraits/20161214/eurytus.jpg',
        'img/portraits/20161214/hector.jpg',
        'img/portraits/20161214/heracles_exp.jpg',
        'img/portraits/20161214/hippolyta.jpg',
        'img/portraits/20161214/icarus.jpg',
        'img/portraits/20161214/jason.jpg',
        'img/portraits/20161214/marsyas.jpg',
        'img/portraits/20161214/medea.jpg',
        'img/portraits/20161214/orpheus.jpg',
        'img/portraits/20161214/pandora.jpg',
        'img/portraits/20161214/paris.jpg',
        'img/portraits/20161214/penthesilea.jpg',
        'img/portraits/20161214/periphetes.jpg',
        'img/portraits/20161214/perseus.jpg',
        'img/portraits/20161214/rhadamanthus.jpg',
        'img/portraits/20161214/sisyphus.jpg',
        'img/portraits/20161214/theseus.jpg',
        'img/portraits/20161215/acamas.jpg',
        'img/portraits/20161215/arachne.jpg',
        'img/portraits/20161215/basilisk.jpg',
        'img/portraits/20161215/calydonian_boar.jpg',
        'img/portraits/20161215/campe.jpg',
        'img/portraits/20161215/caucasian_eagle.jpg',
        'img/portraits/20161215/charybdis.jpg',
        'img/portraits/20161215/chimera.jpg',
        'img/portraits/20161215/colchis_bull.jpg',
        'img/portraits/20161215/colchis_dragon.jpg',
        'img/portraits/20161215/dragon_of_thebes.jpg',
        'img/portraits/20161215/echidna.jpg',
        'img/portraits/20161215/geryon.jpg',
        'img/portraits/20161215/gorgon.jpg',
        'img/portraits/20161215/graeae.jpg',
        'img/portraits/20161215/griffon.jpg',
        'img/portraits/20161215/herald.jpg',
        'img/portraits/20161215/ketos.jpg',
        'img/portraits/20161215/ladon.jpg',
        'img/portraits/20161215/lycaon.jpg',
        'img/portraits/20161215/manticore.jpg',
        'img/portraits/20161215/minos.jpg',
        'img/portraits/20161215/nemean_lion.jpg',
        'img/portraits/20161215/orion.jpg',
        'img/portraits/20161215/phoenix.jpg',
        'img/portraits/20161215/polyphemus.jpg',
        'img/portraits/20161215/python.jpg',
        'img/portraits/20161215/scylla.jpg',
        'img/portraits/20161215/talos.jpg',
        'img/portraits/20161215/teumessian_fox.jpg',
        'img/portraits/20161215/tityos.jpg',
        'img/portraits/20161215_2/argonauts.jpg',
        'img/portraits/20161215_2/artillerymen.jpg',
        'img/portraits/20161215_2/circe_wolves.jpg',
        'img/portraits/20161215_2/giant_spiders.jpg',
        'img/portraits/20161215_2/harpies.jpg',
        'img/portraits/20161215_2/hounds_of_artemis.jpg',
        'img/portraits/20161215_2/lava_golems.jpg',
        'img/portraits/20161215_2/mechanical_warriors.jpg',
        'img/portraits/20161215_2/myrmidons.jpg',
        'img/portraits/20161215_2/satyrs.jpg',
        'img/portraits/20161215_2/scylla_tentacles.jpg',
        'img/portraits/20161215_2/sirens.jpg',
        'img/portraits/20161215_2/spartoi.jpg',
        'img/portraits/20161215_2/stymphalian_birds.jpg',
        'img/portraits/20161215_2/toxotai.jpg'
    ];
    
    // Preload the images; then, update display when returned.
    preloader.preloadImages( $scope.imageLocations ).then(
        function handleResolve( imageLocations ) {
            // Loading was successful.
            $scope.isLoading = false;
            $scope.isSuccessful = true;
            loadXML();
        },
        function handleReject( imageLocation ) {
            // Loading failed on at least one image.
            $scope.isLoading = false;
            $scope.isSuccessful = false;
        },
        function handleNotify( event ) {
            $scope.percentLoaded = event.percent;
        }
    ); 
    
    // Gère l'affichage du menu de gauche
    $scope.toggleLeft = function() {
        $ionicSideMenuDelegate.toggleLeft();
    };
    
    // Retourne le nombre d'unité présente dans la collection du joueur
    $scope.getCollectionLength = function() {
        return Object.size($scope.collection);   
    }
    
    $scope.getTemporaryPicksListLength = function() {
        return Object.size($scope.temporaryPicksList);   
    }
    
    // Permet de savoir si ce qui est passé dans la fonction est une chaine au niveau des templates
    $scope.isString = function(item) {
        return angular.isString(item);
    }

    // Permet de savoir si on veut afficher les infos du mode nemesis
    $scope.displayNemesisMode = function() {
        return $rootScope.nemesis_mode;
    }
    
    // Génère une seed random si besoin
    $rootScope.createSeed = function() {
    	$rootScope.seed =  Math.random().toString().slice(2,8);
    }
    
    $rootScope.createSeed();
    
    // Permet de fixer une seed avec la valeur demandée
    $rootScope.setSeed = function(sd) {
    	$rootScope.seed = sd;
    }
    
    // Retourne une unité venant de la variable unitsDB
    $rootScope.getUnitFromDB = function(unID) {
    	return $rootScope.unitsDB[unID];
    }
    
    // C'est ici qu'on récupère l'évènement pour savoir si on peut lancer isotope avec jquery
    $scope.$on('ngRepeatFinished', function(ngRepeatFinishedEvent) {
        if( Isotope.getIsotopeIsRunning('isoCollection') == true ) {
            
        }
        else {
            Isotope.setDOMElements('isoCollection', $('#isotopeContainer .elem').length);
            Isotope.init('isotopeContainer', 'isoCollection');
            Isotope.initInteractions('isoCollection');
            Isotope.setIsotopeIsRunning('isoCollection', true);
        }
    });
    
    // Permet de recharger les listes isotopes depuis l'interface utilisateur. 
    // Utile quand celles-ci sont déboitées à cause du cache
    $scope.reIsotope = function(iso) {
    	Isotope.reLayout(iso);
    }
    
    // NON UTILISE POUR LE MOMENT - Preference pour ng-bind-html pour l'affichage du html
    // Permet d'afficher du contenu html depuis une string
    $rootScope.sanitizeHTML = function(str) {
        return $sce.trustAsHtml(str);
    }
    
    $rootScope.isBrowser = function() {
    	return Platform.isBrowser();
    }
    
    $rootScope.exitApp = function() {
    	return Platform.exitApp();
    }
    
})

.controller('HomeCtrl', function($rootScope, $scope, $ionicLoading, $state) {
    
	

})

.controller('CollectionCtrl', function($rootScope, $scope, $ionicLoading, $state, $localStorage, Isotope, Popup, $filter) {
    
    // Fonction qui ajoute ou retire une unité à la collection du joueur
    // C'est également ici qu'on modifie le booléen de $scope.sets pour savoir si une case est cochée sur la page qui permet de construire sa collec
    $scope.addToCollection = function(char_id, set) {
        if($scope.sets[set].length > 0) {
            for(var i = 0, arrLen = $scope.sets[set].length; i < arrLen; i++) {
                if($scope.sets[set][i]['data']['_id'] == char_id) {
                    if($scope.sets[set][i]['incollection'] == true) {
                        $scope.sets[set][i]['incollection'] = false;
                        if (char_id in $scope.collection) {
                            delete $scope.collection[char_id];
                            $scope.set_collection_count[set] --;
                        }
                    }
                    else {
                        $scope.sets[set][i]['incollection'] = true;
                        if (!(char_id in $scope.collection)) {
                            $scope.collection[char_id] = $scope.sets[set][i]['data'];
                            $scope.set_collection_count[set] ++;
                        }
                    }
                    // ATTENTION ! Remplacé par le check de onEnter dans les stateproviders de #home et #game
                    // if(Isotope.getIsotopeIsRunning('isoCollection')) Isotope.canYouLaunch('isotopeContainer', 'isoCollection');
                    if(Isotope.getIsotopeIsRunning('isoCollection')) Isotope.setItemsHaveBeenAdded('isoCollection');
                }
            }
            for(var j in $scope.sets) {
                $scope.iReallyOwnEverything = true;
                if($scope.sets[j].length != $scope.set_collection_count[j]) {
                    $scope.iReallyOwnEverything = false;
                    break;
                }
            }
        }
    }
    
    // Fonction qui ajoute toutes les unités d'un set quand celui-ci est cliqué
    $scope.addWholeSetToCollection = function(set) {
        if($scope.sets[set].length > 0) {
            for(var i = 0, arrLen = $scope.sets[set].length; i < arrLen; i++) {
                $scope.addToCollection($scope.sets[set][i]['data']['_id'], set);
            }
        }   
    }
    
    $scope.iOwnEverything = function() {
        for(var i in $scope.sets) {
            $scope.addWholeSetToCollection(i);
        }
    }
    
    $scope.saveCollection = function() {
    	$localStorage.collection = $scope.collection;
    	$localStorage.set_collection_count = $scope.set_collection_count;
    	$localStorage.sets = $scope.sets;
    	Popup.simple($filter('translate')('popup_collectionsaved_title') , $filter('translate')('popup_collectionsaved_desc')); 
    }
     
})

.controller('GameCtrl', function($rootScope, $scope, $ionicLoading, $state, $ionicPopup, $ionicScrollDelegate, $timeout, Popup, Isotope, $localStorage, $filter) {
    
    // Utilisé pour le dev uniquement
    // $rootScope.players = [{'name' : 'Ben', 'rp' : 10, 'maxrp' : 10, 'god' : {}, 'units' : {}, 'bans' : {}, 'omphalos_cards' : 0}, {'name' : 'Johnny', 'rp' : 10, 'maxrp' : 10, 'god' : {}, 'units' : {}, 'bans' : {}, 'omphalos_cards' : 0}, {'name' : 'Poppy', 'rp' : 10, 'maxrp' : 10, 'god' : {}, 'units' : {}, 'bans' : {}, 'omphalos_cards' : 0}];
    // C'est le tableau qui permettra de connaitre l'ordre dans lequel les joueurs choisissent leurs unités. Arrivé au bout du tableau, on le retourne
    $scope.pickOrder = [];
    // Détermine quel joueur est en train de faire son pick
    $scope.currentPicker = 0;
    // Tableau contenant les points de recrutement alloués aux joueurs pour chaque mode de jeu (12 pour 2 joueurs, 10 pour 3, 8 pour 4)
    $scope.rpDefault = [0, 0, 18, 16, 14];
    // Liste des Dieux et Titans dispos qui seront passés à enabledPicksList pour etre affiche en front
    $scope.godsRoster = {};
    // Liste des différents types d'unités. Ces tableaux seront utilisés pour trier les unités dans le randomizer
    $scope.rosters = [];
    $scope.rosters['gods'] = [];
    $scope.rosters['titans'] = [];
    $scope.rosters['heroes'] = [];
    $scope.rosters['monsters'] = [];
    $scope.rosters['troops'] = [];
    
    // Détermine le cout de l'unité restante encore disponible au recrutement
    $scope.lowestRPUnit = 100;
    // Variable qui indique si les picks ont déjà été inversés pour le mode deux joueurs
    $scope.alreadyReversed = false;
    // Valeur maximum d'unités qui sont sorties via le randomizer
    $scope.randomMaxPool = [];
    $scope.randomMaxPool['gods'] = 4;
    $scope.randomMaxPool['titans'] = 0;
    $scope.randomMaxPool['heroes'] = 5;
    $scope.randomMaxPool['monsters'] = 5;
    $scope.randomMaxPool['troops'] = 6;
    
    // Variables par défaut utilisées dans les popups de randomisation
    $scope.randomizerData = {};
    $scope.randomizerData.heroes_max = 5;
    $scope.randomizerData.monsters_max = 4;
    $scope.randomizerData.troops_max = 6;
    $scope.randomizerData.gods_max = 4;
    $scope.randomizerData.titans_max = 0;
    $scope.randomizerData.godsandtitans_max = 0;
    
    
    // Ajoute un joueur dans le tableau "Player" avec toutes les infos nécessaires
    $scope.addPlayer = function(name) {
        var playerInfo = {'name' : '', 'rp' : '', 'maxrp' : '', 'god' : {}, 'units' : {}, 'bans' : {}, 'omphalos_cards' : 0, 'units_dashboards' : {}, 'picked_omphalos' : 0};
        if($rootScope.gameMode != 'custom') {
	        if($scope.playersCount() < 4) {
	            playerInfo['name'] = name;
	            $scope.players.push(playerInfo);
	            $scope.setPlayersRP();
	        }
	        else {
	            // Afficher une popup avec message indiquant que le max de joueurs a été atteint
	        }
        }
        else {
        	if($rootScope.gameManagerStep == "custom_add_players") {
	        	if($scope.playersCount() < 20) {
		            playerInfo['name'] = name;
		            $scope.players.push(playerInfo);
		        }
		        else {
		            // Afficher une popup avec message indiquant que le max de joueurs a été atteint
		        }
        	}
        }
    }
    
    // C'est ici qu'on récupère l'évènement pour savoir si on peut lancer isotope avec jquery 
    $scope.$on('ngRepeatFinishedPicks', function(ngRepeatFinishedEvent) {
        if( Isotope.getIsotopeIsRunning('isoPicks') == true ) {
            
        }
        else {
            Isotope.setDOMElements('isoPicks', $('#isotopeContainerPicks .elem').length);
            Isotope.init('isotopeContainerPicks', 'isoPicks');
            Isotope.initInteractions('isoPicks');
            Isotope.setIsotopeIsRunning('isoPicks', true);
        }
    }); 
    
    // Déclare si on rentre en mode de jeu custom ou normal
    $scope.setGameMode = function(mode) {
    	$rootScope.gameMode = mode;
    } 
    
    // Boucle qui change les RP de chaque joueur
    $scope.setPlayersRP = function() {
    	if($rootScope.gameMode != 'custom') {
	        for(var i=0; i<$scope.playersCount(); i++) {
	            $scope.setIndividualPlayerRP(i, $scope.rpDefault[$scope.playersCount()], $scope.rpDefault[$scope.playersCount()]);      
	        }
    	}
    }
    
    // Change les RP d'un joueur en particulier
    $scope.setIndividualPlayerRP = function(id, rp, maxrp) {
    	if($rootScope.gameMode != 'custom') {
	        $rootScope.players[id]['rp'] = rp;
	        if (typeof maxrp != "undefined") {
	            $rootScope.players[id]['maxrp'] = maxrp;
	        }
    	}
    }
    
    // Donne des cartes omphalos à un joueur
    $scope.setOmphalosCards = function(id, omphalos) {
        $rootScope.players[id]['omphalos_cards'] = omphalos;    
    }
    
    // Retourne le nombre de joueurs déjà rentrés
    $scope.playersCount = function() {
        return $scope.players.length;
    }
    
    // Affiche la popup permettant de rentrer le nom du joueur quand on en ajoute
    $scope.addPlayerPopup = function() {
        $scope.playerData = {};
        var myPopup = $ionicPopup.show({
            template: '<input type="player_name" ng-model="playerData.player_name">',
            title: $filter('translate')('popup_addplayer_playername'),
            subTitle: $filter('translate')('popup_addplayer_desc'),
            scope: $scope,
            buttons: [
                { text: $filter('translate')('popup_button_cancel') },
                {
                    text: '<b>'+ $filter('translate')('popup_button_add') +'</b>',
                    type: 'button-positive',
                    onTap: function(e) {
                        if (!$scope.playerData.player_name) {
                            e.preventDefault();
                        } else {
                            $scope.addPlayer($scope.playerData.player_name);
                        }
                    }
                }
            ]
        });
    };
    
    // Affiche la popup demandant si l'utilisateur veut faire une liste d'unités random
    $scope.askRandomizerPopup = function(temporary) {
        // On build les tableaux temporaires qui serviront à récupérer les différents types d'unités
        $scope.rosters['heroes'] = [];
        $scope.rosters['monsters'] = [];
        $scope.rosters['troops'] = [];
        for(var i in $scope.collection) {
            if($scope.collection[i]['_type'] == 'hero') {
                $scope.rosters['heroes'].push($scope.collection[i]);
            }
        }
        for(var i in $scope.collection) {
            if($scope.collection[i]['_type'] == 'monster') {
                $scope.rosters['monsters'].push($scope.collection[i]);
            }
        }
        for(var i in $scope.collection) {
            if($scope.collection[i]['_type'] == 'troop' && $scope.collection[i]['_notpickable'] != 'true') {
                $scope.rosters['troops'].push($scope.collection[i]);
            }
        }
         
        if(temporary == true) {
        	popup_title = 'popup_temporarypick_title';
        	popup_desc = 'popup_temporarypick_desc';
        }
        else {
        	popup_title = 'popup_pickphase2_title';
        	popup_desc = 'popup_pickphase2_desc';
        }
        
        var myPopup = $ionicPopup.show({
            template: '<div class="randomizer_range"><h3>'+ $filter('translate')('general_heroes') +' : </h3><input readonly class="info" type="text" ng-model="randomizerData.heroes_max" /><div class="clear"></div><div class="item range"><input type="range" min="0" max="'+$scope.rosters['heroes'].length+'" ng-model="randomizerData.heroes_max"></div><div class="clear"></div><h3>'+ $filter('translate')('general_monsters') +' : </h3><input readonly class="info" type="text" ng-model="randomizerData.monsters_max" /><div class="clear"></div><div class="item range"><input type="range" min="0" max="'+$scope.rosters['monsters'].length+'" ng-model="randomizerData.monsters_max"></div><div class="clear"></div><h3>'+ $filter('translate')('general_troops') +' : </h3><input readonly class="info" type="text" ng-model="randomizerData.troops_max" /><div class="clear"></div><div class="item range"><input type="range" min="0" max="'+$scope.rosters['troops'].length+'" ng-model="randomizerData.troops_max"></div></div><div class="seed_picker"><h3>Seed</h3><input type="custom_seed" ng-value="seed" ng-model="randomizerData.custom_seed"><div class="randseed_button ion-android-sync" ng-click="createSeed()"></div></div><br /><div class="clear"></div>',
            title: $filter('translate')(popup_title),
            subTitle: $filter('translate')(popup_desc),
            scope: $scope,
            buttons: [
                { 
                    text: $filter('translate')('popup_button_no'),
                    onTap: function(e) {
                    	if(temporary == true) {
                    		$scope.buildRandomizedPool(false, true);
                    	}
                    	else {
                    		$scope.buildRandomizedPool(false, false);
                    	}
                    }
                },
                {
                    text: '<b>'+ $filter('translate')('popup_button_yes') +'</b>',
                    type: 'button-positive',
                    onTap: function(e) {
                        $scope.randomMaxPool['heroes'] = $scope.randomizerData.heroes_max;
                        $scope.randomMaxPool['monsters'] = $scope.randomizerData.monsters_max;
                        $scope.randomMaxPool['troops'] = $scope.randomizerData.troops_max;
                        if ($scope.randomizerData.custom_seed != undefined && $scope.randomizerData.custom_seed != 'undefined') $rootScope.setSeed($scope.randomizerData.custom_seed);
                        if(temporary == true) {
                    		$scope.buildRandomizedPool(true, true);
                    	}
                    	else {
                    		$scope.buildRandomizedPool(true, false);
                    	}
                    }
                }
            ]
        });
    };
    
    // Affiche la popup demandant si l'utilisateur veut faire une liste de Dieux et de Titans random
    $scope.askGodsRandomizerPopup = function() {
        $scope.rosters['gods'] = [];
        $scope.rosters['titans'] = [];
        for(var i in $scope.collection) {
            if($scope.collection[i]['_type'] == 'god') {
                $scope.rosters['gods'].push($scope.collection[i]);
            }
        }
        for(var i in $scope.collection) {
            if($scope.collection[i]['_type'] == 'titan') {
                $scope.rosters['titans'].push($scope.collection[i]);
            }
        }
        
        var myPopup = $ionicPopup.show({
            template: '<div class="randomizer_range"><h3>'+ $filter('translate')('general_gods') +' : </h3><input readonly class="info" type="text" ng-model="randomizerData.gods_max" /><div class="clear"></div><div class="item range"><input type="range" min="0" max="'+$scope.rosters['gods'].length+'" ng-model="randomizerData.gods_max"></div><div class="clear"></div><h3>'+ $filter('translate')('general_titans') +' : </h3><input readonly class="info" type="text" ng-model="randomizerData.titans_max" /><div class="clear"></div><div class="item range"><input type="range" min="0" max="'+$scope.rosters['titans'].length+'" ng-model="randomizerData.titans_max"></div><div class="clear"></div><h3>'+ $filter('translate')('general_gods') + ' & ' + $filter('translate')('general_titans') +' : </h3><input readonly class="info" type="text" ng-model="randomizerData.godsandtitans_max" /><div class="clear"></div><div class="item range"><input type="range" min="0" max="'+($scope.rosters['gods'].length+$scope.rosters['titans'].length)+'" ng-model="randomizerData.godsandtitans_max"></div><div class="clear"></div></div><div class="seed_picker"><h3>Seed</h3><input type="custom_seed" ng-value="seed" ng-model="randomizerData.custom_seed"><div class="randseed_button ion-android-sync" ng-click="createSeed()"></div></div><br /><div class="clear"></div>',
            title: $filter('translate')('popup_pickphase1_title'),
            subTitle: $filter('translate')('popup_pickphase1_desc'),
            scope: $scope,
            buttons: [
                { 
                    text: $filter('translate')('popup_button_no'),
                    onTap: function(e) {
                        $scope.buildRandomizedPoolOfGods(false);
                    }
                },
                {
                    text: '<b>'+ $filter('translate')('popup_button_yes') +'</b>',
                    type: 'button-positive',
                    onTap: function(e) {
                        $scope.randomMaxPool['gods'] = $scope.randomizerData.gods_max;
                        $scope.randomMaxPool['titans'] = $scope.randomizerData.titans_max;

                        if(parseInt($scope.randomizerData.godsandtitans_max) > 0) {
                        	var tempRand = parseInt($scope.randomizerData.godsandtitans_max);
                        	var godsAdd = Math.floor((Math.random() * tempRand) + 1);
                        	var tempSurplus = 0;
                        	tempRand = tempRand - godsAdd;
                        	$scope.randomMaxPool['gods'] = parseInt($scope.randomMaxPool['gods']) + godsAdd;
                        	$scope.randomMaxPool['titans'] = parseInt($scope.randomMaxPool['titans']) + tempRand;
                        	
                        	if($scope.randomMaxPool['titans'] > $scope.rosters['titans'].length) {
                        		tempSurplus = $scope.randomMaxPool['titans'] - $scope.rosters['titans'].length;
                        		$scope.randomMaxPool['titans'] = $scope.rosters['titans'].length;
                        		$scope.randomMaxPool['gods'] = $scope.randomMaxPool['gods'] + tempSurplus;
                        	}
                        	if($scope.randomMaxPool['gods'] > $scope.rosters['gods'].length) {
                        		tempSurplus = $scope.randomMaxPool['gods'] - $scope.rosters['gods'].length;
                        		$scope.randomMaxPool['gods'] = $scope.rosters['gods'].length;
                        		$scope.randomMaxPool['titans'] = $scope.randomMaxPool['titans'] + tempSurplus;
                        	}
                        	if($scope.randomMaxPool['titans'] > $scope.rosters['titans'].length) $scope.randomMaxPool['titans'] = $scope.rosters['titans'].length;
                        	
                        }

                        if ($scope.randomizerData.custom_seed != undefined && $scope.randomizerData.custom_seed != 'undefined')$rootScope.setSeed($scope.randomizerData.custom_seed);
                        $scope.buildRandomizedPoolOfGods(true);
                    }
                }
            ]
        });
    };
    
    // Crée le pool d'unités aléatoire depuis la collection
    // Ou crée un pool reprenant toutes les unités de la collection si le booléen passé est false
    $scope.buildRandomizedPool = function(bool, temporary) {
        
    	Math.seedrandom($rootScope.seed);
    	
    	if(temporary == true) {
    		$rootScope.temporaryPicksList = {};
    	}
    	else {
    		$rootScope.temporaryPicksList = {};
    		$rootScope.enabledPicksList = {};
    	}
        
        if(bool == true) {
            var totalRecruitmentPoints = 0;
            
            $scope.rosters['heroes'] = [];
            $scope.rosters['monsters'] = [];
            $scope.rosters['troops'] = [];

            // On build les tableaux temporaires qui serviront à récupérer les différents types d'unités
            for(var i in $scope.collection) {
                if($scope.collection[i]['_type'] == 'hero') {
                    $scope.rosters['heroes'].push($scope.collection[i]);
                }
            }
            for(var i in $scope.collection) {
                if($scope.collection[i]['_type'] == 'monster') {
                    $scope.rosters['monsters'].push($scope.collection[i]);
                }
            }
            for(var i in $scope.collection) {
                if($scope.collection[i]['_type'] == 'troop' && $scope.collection[i]['_notpickable'] != 'true') {
                    $scope.rosters['troops'].push($scope.collection[i]);
                }
            }

            var rd = 0;
            for(var i =0;i<$scope.randomMaxPool['heroes'];i++) {
                if($scope.rosters['heroes'].length > 0) {
                    rd = Math.floor((Math.random() * ($scope.rosters['heroes'].length)));
                    if(temporary == true) {
                    	$rootScope.temporaryPicksList[$scope.rosters['heroes'][rd]['_id']] = $scope.rosters['heroes'][rd];
                	}
                	else {
                		$rootScope.enabledPicksList[$scope.rosters['heroes'][rd]['_id']] = $scope.rosters['heroes'][rd];
                	}
                    totalRecruitmentPoints = totalRecruitmentPoints + parseInt($scope.rosters['heroes'][rd]['_recruitment_cost']);
                    $scope.rosters['heroes'].splice(rd, 1);
                }
                else {
                    break;
                }
            }
            for(var i =0;i<$scope.randomMaxPool['monsters'];i++) {
                if($scope.rosters['monsters'].length > 0) {
                    rd = Math.floor((Math.random() * ($scope.rosters['monsters'].length)));
                    if(temporary == true) {
                    	$rootScope.temporaryPicksList[$scope.rosters['monsters'][rd]['_id']] = $scope.rosters['monsters'][rd];
                    }
                    else {
                    	$rootScope.enabledPicksList[$scope.rosters['monsters'][rd]['_id']] = $scope.rosters['monsters'][rd];
                    }
                    totalRecruitmentPoints = totalRecruitmentPoints + parseInt($scope.rosters['monsters'][rd]['_recruitment_cost']);
                    $scope.rosters['monsters'].splice(rd, 1);
                }
                else {
                    break;
                }
            }
            var ji = 0;
            while(ji < $scope.randomMaxPool['troops']) {
                if($scope.rosters['troops'].length > 0) {
                    rd = Math.floor((Math.random() * ($scope.rosters['troops'].length)));
                    if($scope.rosters['troops'][rd]['_notpickable'] == 'true') {
                        
                    }
                    else {
                    	if(temporary == true) {
                    		$rootScope.temporaryPicksList[$scope.rosters['troops'][rd]['_id']] = $scope.rosters['troops'][rd];
                    	}
                    	else {
                    		$rootScope.enabledPicksList[$scope.rosters['troops'][rd]['_id']] = $scope.rosters['troops'][rd];
                    	}
                        totalRecruitmentPoints = totalRecruitmentPoints + parseInt($scope.rosters['troops'][rd]['_recruitment_cost']);
                        $scope.rosters['troops'].splice(rd, 1);
                        ji++;
                    }
                }
                else {
                    break;
                }
            }
            
        }
        else {
            for(var i in $scope.collection) {
                if($scope.collection[i]['_type'] != 'god' && $scope.collection[i]['_type'] != 'titan' && $scope.collection[i]['_notpickable'] != 'true') {
                	if(temporary == true) {
                		$rootScope.temporaryPicksList[$scope.collection[i]['_id']] = $scope.collection[i];
                	}
                	else {
                		$rootScope.enabledPicksList[$scope.collection[i]['_id']] = $scope.collection[i];
                	}
                }
            }
        }
        
    }
    
    
    // Crée le pool de Dieux et de Titans aléatoire depuis la collection
    // Ou crée un pool reprenant tous les Dieux et Titans de la collection si le booléen passé est false
    $scope.buildRandomizedPoolOfGods = function(bool) {
    	
    	Math.seedrandom($rootScope.seed);
    	
        $rootScope.enabledPicksList = {};
        
        if(bool == true) {
             
            $scope.rosters['gods'] = [];
            $scope.rosters['titans'] = [];

            for(var i in $scope.collection) {
                if($scope.collection[i]['_type'] == 'god') {
                    $scope.rosters['gods'].push($scope.collection[i]);
                }
            }
            for(var i in $scope.collection) {
                if($scope.collection[i]['_type'] == 'titan') {
                    $scope.rosters['titans'].push($scope.collection[i]);
                }
            }

            var rd = 0;
            for(var i =0;i<$scope.randomMaxPool['gods'];i++) {
                if($scope.rosters['gods'].length > 0) {
                    rd = Math.floor((Math.random() * ($scope.rosters['gods'].length)));
                    $rootScope.enabledPicksList[$scope.rosters['gods'][rd]['_id']] = $scope.rosters['gods'][rd];
                    $scope.rosters['gods'].splice(rd, 1);
                }
                else {
                    break;
                }
            }
            for(var i =0;i<$scope.randomMaxPool['titans'];i++) {
                if($scope.rosters['titans'].length > 0) {
                    rd = Math.floor((Math.random() * ($scope.rosters['titans'].length)));
                    $rootScope.enabledPicksList[$scope.rosters['titans'][rd]['_id']] = $scope.rosters['titans'][rd];
                    $scope.rosters['titans'].splice(rd, 1);
                }
                else {
                    break;
                }
            }
        }
        else {
            for(var i in $scope.collection) {
                if($scope.collection[i]['_type'] != 'hero' && $scope.collection[i]['_type'] != 'monster' && $scope.collection[i]['_type'] != 'troop' && $scope.collection[i]['_notpickable'] != 'true') {
                    $rootScope.enabledPicksList[$scope.collection[i]['_id']] = $scope.collection[i];
                }
            }
        }
        
        $scope.nextPicker();
          
    }
    
    // Rentre dans le mode d'ajout de joueurs (jusqu'à 20) du mode de jeu Custom
    $scope.startCustomAddPlayers = function() {
    	// Things to do
    }
    
    // Met en place la première partie des picks (sélection des Dieux)
    $scope.startGodsPick = function() {
    	// Appelle la popup demandant si l'utilisateur souhaite générer une liste d'unité aléatoire
    	// pour faciliter le choix des Dieux
    	$scope.askRandomizerPopup(true);
    	// Appelle la popup de génération de la liste des Dieux et Titans
    	$scope.askGodsRandomizerPopup();
    	$timeout(function(){
            $ionicScrollDelegate.scrollTop(false);
        }, 50); 
    }
    
    // Fonction qui retourne true ou false en fonction de si l'unité sélectionnée à les stats évolutives rentrées dans le xml ou non
    $rootScope.hasEvoStats = function(id) {
        if ('stats' in $scope.collection[id]) {
            return true
        }
        else {
            return false;
        }
    }
    
    // Retourne la ligne des stats en fonction des points de vie actuelle de l'unité
    $rootScope.getCurrentStatLine = function(player_id, id) {
        return $scope.collection[id]['stats']['stat'].length - $rootScope.players[player_id]['units_dashboards'][id]['hp'];
    }
    
    // Permet de créer une classe css qui illustre la santé des unités (couleur allant de vert à rouge)
    $scope.getHealthColor = function(player_id, id) {
        var tmpMaxHP = $scope.collection[id]['stats']['stat'].length;
        var tmpCurrentHP = $rootScope.players[player_id]['units_dashboards'][id]['hp'];
        var tmpPercent = (tmpCurrentHP/tmpMaxHP)*100;
        
        if(tmpCurrentHP == 1) return 'health_10';
        if(tmpPercent == 100) return 'health_100';
        if(tmpPercent > 90) return 'health_90';
        if(tmpPercent > 80) return 'health_80';
        if(tmpPercent > 70) return 'health_70';
        if(tmpPercent > 60) return 'health_60';
        if(tmpPercent > 50) return 'health_50';
        if(tmpPercent > 40) return 'health_40';
        if(tmpPercent > 30) return 'health_30';
        if(tmpPercent > 20) return 'health_20';
        if(tmpPercent > 10) return 'health_10';
        return 'health_0';
        
    }
    
    
    // Met en place la liste des unités
    $scope.startUnitsPick = function() {
        $scope.askRandomizerPopup();
        $timeout(function(){
            $ionicScrollDelegate.scrollTop(false);
        }, 50);
        if(Isotope.getIsotopeIsRunning('isoPicks')) {
            Isotope.setItemsHaveBeenAdded('isoPicks');
            Isotope.canYouLaunch('isotopeContainerPicks', 'isoPicks');
        }
    }
    
    // Gère les points de vie des unités (gestion du dashboard en jeu)
    $rootScope.setUnitHealth = function(op, id, player_id) {
        if(op == 'add') {
            if(parseInt($rootScope.players[player_id]['units_dashboards'][id]['hp']) == ($scope.collection[id]['stats'].stat.length)) {
                
            }
            else {
                $rootScope.players[player_id]['units_dashboards'][id]['hp'] = parseInt($rootScope.players[player_id]['units_dashboards'][id]['hp']) + 1;
                $rootScope.players[player_id]['units_dashboards'][id]['pos'] = parseInt($rootScope.players[player_id]['units_dashboards'][id]['pos']) - 38;
            }
        }
        
        if(op == 'sub') {
            if(parseInt($rootScope.players[player_id]['units_dashboards'][id]['hp']) == 0) {
                
            }
            else {
                $rootScope.players[player_id]['units_dashboards'][id]['hp'] = parseInt($rootScope.players[player_id]['units_dashboards'][id]['hp']) - 1;
                $rootScope.players[player_id]['units_dashboards'][id]['pos'] = parseInt($rootScope.players[player_id]['units_dashboards'][id]['pos']) + 38;
            }
        }
        
    }
    
    // C'est ici qu'on gère les cas spécifiques au moment des picks (artemis et ses chiens, arachne et ses araignées, etc.)
    $scope.manageOddCases = function(id) {
        
        // Unités qui sont exclusives à un pick (exemple les araignées d'arachne, les chiens d''artemis)
        var exclusiveCorrespondance = {'artemis'          : 107,
                                       'arachne'          : 105,
                                       'scylla'           : 113,
                                       'circe'            : 104,
                                       'dragon of thebes' : 115
                                      
        };
        // Unités qui peuvent etre acquises par n'importe qui mais qui sont prises automatiquement et gratuitement par le déclenchement d'un pick
        var freeCorrespondance = {'hephaestus': 109,
                                  'pan'       : 112
            
        }
        
        if($rootScope.enabledPicksList[id]['_code_name'] in exclusiveCorrespondance) {
            var tmpID = exclusiveCorrespondance[$rootScope.enabledPicksList[id]['_code_name']];
            if((tmpID in $scope.collection) && $rootScope.unavailablePicks[tmpID] != true) {
                $rootScope.players[$scope.pickOrder[$scope.currentPicker]]['units'][tmpID] = $scope.collection[tmpID];
                $rootScope.players[$scope.pickOrder[$scope.currentPicker]]['units_dashboards'][tmpID] = {};
                $rootScope.players[$scope.pickOrder[$scope.currentPicker]]['units_dashboards'][tmpID]['pos'] = 0;
                $rootScope.players[$scope.pickOrder[$scope.currentPicker]]['units_dashboards'][tmpID]['hp'] = $scope.collection[tmpID]['stats'].stat.length;
                $rootScope.unavailablePicks[tmpID] = true;
            }
            return;
        }
        
        if($rootScope.enabledPicksList[id]['_code_name'] in freeCorrespondance) {
            var tmpID = freeCorrespondance[$rootScope.enabledPicksList[id]['_code_name']];
            if((tmpID in $scope.collection) && $rootScope.unavailablePicks[tmpID] != true) {
                $rootScope.players[$scope.pickOrder[$scope.currentPicker]]['units'][tmpID] = $scope.collection[tmpID];
                $rootScope.players[$scope.pickOrder[$scope.currentPicker]]['units_dashboards'][tmpID] = {};
                $rootScope.players[$scope.pickOrder[$scope.currentPicker]]['units_dashboards'][tmpID]['pos'] = 0;
                $rootScope.players[$scope.pickOrder[$scope.currentPicker]]['units_dashboards'][tmpID]['hp'] = $scope.collection[tmpID]['stats'].stat.length;
                $rootScope.unavailablePicks[tmpID] = true;
            }
            return;
        }
        
        if($rootScope.enabledPicksList[id]['_code_name'] == "achilles") {
            if((70 in $scope.collection) && $rootScope.unavailablePicks[70] != true) {
                $rootScope.unavailablePicks[70] = true;
            }
            return;
        }
        if($rootScope.enabledPicksList[id]['_code_name'] == "achilles veteran") {
            if((6 in $scope.collection) && $rootScope.unavailablePicks[6] != true) {
                $rootScope.unavailablePicks[6] = true;
            }
            return;
        }
        if($rootScope.enabledPicksList[id]['_code_name'] == "heracles") {
            if((55 in $scope.collection) && $rootScope.unavailablePicks[55] != true) {
                $rootScope.unavailablePicks[55] = true;
            }
            return;
        }
        if($rootScope.enabledPicksList[id]['_code_name'] == "heracles experienced") {
            if((5 in $scope.collection) && $rootScope.unavailablePicks[5] != true) {
                $rootScope.unavailablePicks[5] = true;
            }
            return;
        }
        
    }
    
    // La fonction qui gère l'ajout des picks
    $rootScope.pickUnit = function(id) {
        if (typeof id != "undefined") { 
            if( $rootScope.gameManagerStep == "gods_picks" ) {
            	// Depuis le changement de règle sur le recrutement des Dieux, cette condition a été ajoutée
            	if($rootScope.gameMode != 'custom') {
                	$scope.setIndividualPlayerRP($scope.pickOrder[$scope.currentPicker], $rootScope.players[$scope.pickOrder[$scope.currentPicker]]['rp']-$rootScope.enabledPicksList[id]['_recruitment_cost']);
                }
                $rootScope.players[$scope.pickOrder[$scope.currentPicker]]['god'][id] = $rootScope.enabledPicksList[id];
                $rootScope.players[$scope.pickOrder[$scope.currentPicker]]['units_dashboards'][id] = {};
                $rootScope.players[$scope.pickOrder[$scope.currentPicker]]['units_dashboards'][id]['pos'] = 0;
                $rootScope.players[$scope.pickOrder[$scope.currentPicker]]['units_dashboards'][id]['hp'] = $rootScope.enabledPicksList[id]['stats'].stat.length;
                $rootScope.unavailablePicks[id] = true;
                $scope.manageOddCases(id);
                if($rootScope.gameMode != 'custom') {
                	// Depuis le rework des règles de recrutement des Dieux, on a plus besoin de cette condition
	                /*
	                if($rootScope.enabledPicksList[id]['_type'] == "god" || $rootScope.enabledPicksList[id]['_type'] == "titan") {
	                    if(parseInt($rootScope.enabledPicksList[id]['_recruitment_points']) != 0) {
	                        $scope.setIndividualPlayerRP($scope.pickOrder[$scope.currentPicker], parseInt($rootScope.players[$scope.pickOrder[$scope.currentPicker]]['rp'])+parseInt($rootScope.enabledPicksList[id]['_recruitment_points']), parseInt($rootScope.players[$scope.pickOrder[$scope.currentPicker]]['maxrp'])+parseInt($rootScope.enabledPicksList[id]['_recruitment_points']));                       
	                    }
	                }
	                */
                	$scope.nextPicker();
                }
                return;
            }
            if( $rootScope.gameManagerStep == "units_picks" ) {
                if($rootScope.players[$scope.pickOrder[$scope.currentPicker]]['rp'] >= $rootScope.enabledPicksList[id]['_recruitment_cost']) {
                    var idToCheck = $scope.pickOrder[$scope.currentPicker];
                    if($rootScope.gameMode != 'custom') {
                    	$scope.setIndividualPlayerRP($scope.pickOrder[$scope.currentPicker], $rootScope.players[$scope.pickOrder[$scope.currentPicker]]['rp']-$rootScope.enabledPicksList[id]['_recruitment_cost']);
                    }
                    $rootScope.players[$scope.pickOrder[$scope.currentPicker]]['units'][id] = $rootScope.enabledPicksList[id];
                    $rootScope.players[$scope.pickOrder[$scope.currentPicker]]['units_dashboards'][id] = {};
                    $rootScope.players[$scope.pickOrder[$scope.currentPicker]]['units_dashboards'][id]['pos'] = 0;
                    $rootScope.players[$scope.pickOrder[$scope.currentPicker]]['units_dashboards'][id]['hp'] = $rootScope.enabledPicksList[id]['stats'].stat.length;
                    $rootScope.unavailablePicks[id] = true;
                    $scope.manageOddCases(id);
                    if($rootScope.gameMode != 'custom') {
                    	$scope.nextPicker();
                    }
                }
                else {
                	if($rootScope.gameMode != 'custom') {
                		Popup.simple($filter('translate')('popup_cantrecruit_title') , $filter('translate')('popup_cantrecruit_desc'));
                	}
                }
                return;
            }
        }
        
    }
    
    // Fonction qui définit si un joueur peut encore recruté des unités disponibles ou non.
    // Si ce n'est pas le cas, le joueur reçoit des cartes d'Omphalos
    $scope.checkAvailableRecruitmentCosts = function(id) {
        var idToCheck = $scope.pickOrder[$scope.currentPicker];
        if (typeof id != "undefined") { 
            idToCheck = id;
        }
        var tmpRPCost = 100;
        for(var unid in $rootScope.enabledPicksList) {
            if($rootScope.unavailablePicks[$rootScope.enabledPicksList[unid]['_id']] != true) {
                if($rootScope.enabledPicksList[unid]['_recruitment_cost'] < tmpRPCost) {
                    tmpRPCost = $rootScope.enabledPicksList[unid]['_recruitment_cost'];  
                }
            }
        }
        $scope.lowestRPUnit = tmpRPCost;
        if($rootScope.players[idToCheck]['rp'] < $scope.lowestRPUnit) {
            if($rootScope.players[idToCheck]['rp'] != 0) {
            	Popup.simple($rootScope.players[idToCheck]['name'], $filter('translate')('popup_cantrecruit_anymore', {omphalos_cards : $rootScope.players[$scope.pickOrder[$scope.currentPicker]]['rp']} ) );
            	$scope.setOmphalosCards(idToCheck, $rootScope.players[idToCheck]['rp']);
                $scope.setIndividualPlayerRP(idToCheck, 0);
            }
        }
    }
    
    // Fonction de base qui gère le pick order des joueurs 
    $scope.nextPicker = function() {
    	if($rootScope.gameMode == 'custom') {
    		var arrTotal = $scope.pickOrder.length;
    		// Si on est en custom mode, on remplit le tableau des pick orders avec les joueurs qui ont été ajoutés par la suite
        	if($scope.players.length > arrTotal) {
        		arrTotal = $scope.pickOrder.length;
        		// Ici comme on sait que le checker passera forcément ici uniquement la première fois, 
        		// on s'assure que le premier joueur sera bien le joueur 0 du tableau
        		$scope.currentPicker = -1;
        		for(var i=0; i < $scope.players.length; i++) {
                    $scope.pickOrder.push(i);
                }
        	}
        	var idToCheck = $scope.pickOrder[$scope.currentPicker];
            if($scope.currentPicker == arrTotal-1) {
                $scope.currentPicker = 0;
                
            }
            else {
                $scope.currentPicker++;
            }
            //Popup.simple($rootScope.players[$scope.pickOrder[$scope.currentPicker]]['name'] , "It's your turn to pick.");
        }
    	else {
    		var arrTotal = $scope.pickOrder.length;
            // Si le tableau de pick order est vide, on le crée
            if(arrTotal == 0) {
                for(var i=0; i < $scope.players.length; i++) {
                    $scope.pickOrder.push(i);
                }
            }
            else {
                var idToCheck = $scope.pickOrder[$scope.currentPicker];
                
            		if($scope.currentPicker == arrTotal-1) {
						$scope.currentPicker = 0;
						if(!$scope.alreadyReversed) {
							$scope.pickOrder.reverse();    
							$scope.alreadyReversed = true;
						}
        			}
            		else {
        				$scope.currentPicker++;
        			}
                
//                if($scope.currentPicker == arrTotal-1) {
//                    $scope.currentPicker = 0;
//                    $scope.pickOrder.reverse();
//                    // if( $scope.playersCount() == 2 ) {
//                        if( $scope.alreadyReversed ) {
//                            $scope.currentPicker++;
//                        }
//                        else {
//                            $scope.alreadyReversed = true;
//                        }
//                    // }
//                }
//                else {
//                	$scope.currentPicker++;
//                }
                if($rootScope.gameManagerStep != 'gods_picks') $scope.checkAvailableRecruitmentCosts();
                if($rootScope.players[$scope.pickOrder[$scope.currentPicker]]['rp'] == 0) {
                    // Si un joueur n'a plus de rp on check si les autres sont dans le meme cas et on
                    // indique au game manager que cette phase est terminée
                    var allRPSpent = true;
                    for(var i=0; i < $scope.players.length; i++) {
                        if($rootScope.players[i]['rp'] > 0) {
                            allRPSpent = false;
                            break;
                        }
                    }
                    if(allRPSpent) {
                        $scope.manageGMMode('end');
                        return;
                    }
                    else {
                        $scope.nextPicker();
                        return;
                    }
                }
            }
            $scope.manageGMMode();
    	}
    	
        
    }
    
    // C'est la fonction qui gère les différents modes du Game Manager
    $scope.manageGMMode = function(status) {
        
        if (typeof status != "undefined") {
            if(status == 'end') {
                $rootScope.gameManagerStep = "end";
                if($rootScope.gameMode != 'custom') {
                	Popup.simple($filter('translate')('popup_pickphase3_title') , $filter('translate')('popup_pickphase3_desc'));
                }
                $timeout(function(){
                    $ionicScrollDelegate.scrollTop(false);
                }, 50);
            }
            return;
        }
        
        if($rootScope.gameManagerStep == 'units_picks') {
            $timeout(function(){
                $ionicScrollDelegate.scrollTop(false);
            }, 50);
            Popup.simple($rootScope.players[$scope.pickOrder[$scope.currentPicker]]['name'] , $filter('translate')('popup_turns_units', {rp: $rootScope.players[$scope.pickOrder[$scope.currentPicker]]['rp']}) );
            return;
        }
        
        if($rootScope.gameManagerStep == 'gods_picks') {
        	if($rootScope.gameMode == 'custom') {
        		$rootScope.gameManagerStep = "units_picks";
        		$scope.startUnitsPick();
        	}
        	else {
        		var allGodsPicked = true;
                for(var i=0; i < $scope.players.length; i++) {
                    if(Object.size($rootScope.players[i].god) == 0) {
                        allGodsPicked = false;
                        break;
                    }
                }
                if(allGodsPicked) { 
                    $rootScope.gameManagerStep = "units_picks"; 
                    $scope.startUnitsPick();
                    //Popup.simple("The Gods have been choosen" , "Buy Heroes, Monsters and Troops with your Recruitment Points.");
                }
                else {
                    $timeout(function(){
                        $ionicScrollDelegate.scrollTop(false);
                    }, 50);
                    Popup.simple($rootScope.players[$scope.pickOrder[$scope.currentPicker]]['name'] , $filter('translate')('popup_turns_gods'));
                }
        	}
        	return;
        }
        
        if($rootScope.gameManagerStep == "custom_add_players") {
        	$rootScope.gameManagerStep = "gods_picks"; 
            $scope.startGodsPick();
            return;
        }
        
        if($rootScope.gameManagerStep == 'none') {
        	if($rootScope.gameMode != 'custom') {
	            $rootScope.gameManagerStep = "gods_picks"; 
	            $scope.startGodsPick();
	            return;
        	}
        	else {
        		$rootScope.gameManagerStep = "custom_add_players"; 
	            $scope.startCustomAddPlayers();
	            return;
        	}
        }
         
    }
    
    // Sauvegarde
    $scope.saveGame = function() {
    	$localStorage.players = $rootScope.players;
    	$localStorage.gameMode = $rootScope.gameMode;
    	$localStorage.gameManagerStep = $rootScope.gameManagerStep;
    	Popup.simple($filter('translate')('popup_savegame_title') , $filter('translate')('popup_savegame_desc'));
    }
    
    // Popup Game Cancel
    $scope.popupCancelGame = function() {
	    var popupCancelGame = $ionicPopup.show({
	        title: $filter('translate')('popup_cancelgame_title'),
	        subTitle: $filter('translate')('popup_cancelgame_desc'),
	        scope: $scope,
	        buttons: [
	            { 
	                text: $filter('translate')('popup_button_no')
	            },
	            {
	                text: '<b>'+ $filter('translate')('popup_button_yes') +'</b>',
	                type: 'button-positive',
	                onTap: function(e) {
	                	$scope.cancelGame();
	                }
	            }
	        ]
	    });
    }
    
    
    // Relance une partie et réinitialise toutes les variables et les tableaux nécessaires
    $scope.cancelGame = function() {
        $rootScope.players = [];
        $scope.pickOrder = [];
        $scope.currentPicker = 0;
        $scope.godsRoster = {};
        $scope.rosters = [];
        $scope.rosters['gods'] = [];
        $scope.rosters['titans'] = [];
        $scope.rosters['heroes'] = [];
        $scope.rosters['monsters'] = [];
        $scope.rosters['troops'] = [];
        $rootScope.enabledPicksList = {};
        $rootScope.unavailablePicks = {};
        $rootScope.gameManagerStep = 'none';
        Isotope.setIsotopeIsRunning('isoPicks', false);
        $scope.alreadyReversed = false;
        $rootScope.gameMode = 'normal';
        if (typeof(Storage) !== "undefined") {
        	delete $localStorage.players;
        	delete $localStorage.gameMode;
        	delete $localStorage.gameManagerStep;
        }
        
    }
     
})

.controller('PlayerPicksCtrl', function($rootScope, $scope, $ionicLoading, $state, $stateParams) {
    
    if (typeof $rootScope.players == 'undefined' || $rootScope.players.length == 0) {
        $state.go('home');
    }
    else {
        if($stateParams.player_id != 'none') {
            $scope.player_id = $stateParams.player_id;
        }

        $scope.player_units_list = [];
        $scope.omphalos_cards = parseInt($rootScope.players[$scope.player_id]['omphalos_cards']);

        $scope.player_activation_cards = 0;
        $scope.player_artofwar_cards = 3;
        $scope.player_cards_count =  $scope.player_artofwar_cards + $scope.player_activation_cards + $scope.omphalos_cards;

        for(var i in $rootScope.players[$scope.player_id].god) {
            $scope.player_units_list.push($rootScope.players[$scope.player_id].god[i]);
            $scope.player_activation_cards = $scope.player_activation_cards + parseInt($rootScope.players[$scope.player_id].god[i]['_activation_cards']);
            $scope.player_artofwar_cards = $scope.player_artofwar_cards + parseInt($rootScope.players[$scope.player_id].god[i]['_artofwar_cards']);
            $scope.player_cards_count = $scope.player_cards_count + parseInt($rootScope.players[$scope.player_id].god[i]['_activation_cards']) + parseInt($rootScope.players[$scope.player_id].god[i]['_artofwar_cards']);
        }

        for(var j in $rootScope.players[$scope.player_id].units) {
            $scope.player_units_list.push($rootScope.players[$scope.player_id].units[j]);
            $scope.player_activation_cards = $scope.player_activation_cards + parseInt($rootScope.players[$scope.player_id].units[j]['_activation_cards']);
            $scope.player_artofwar_cards = $scope.player_artofwar_cards + parseInt($rootScope.players[$scope.player_id].units[j]['_artofwar_cards']);
            $scope.player_cards_count = $scope.player_cards_count + parseInt($rootScope.players[$scope.player_id].units[j]['_activation_cards']) + parseInt($rootScope.players[$scope.player_id].units[j]['_artofwar_cards']);
        }
    } 
    
})

.controller('UnitCtrl', function($rootScope, $scope, $ionicLoading, $state, $stateParams) {
	
    if (typeof $scope.collection == 'undefined' || $scope.collection.length == 0) {
        $state.go('home');
    }
    else {
        if($stateParams.unit_id != 'none') {
        	
        	function tryUnitDB() {
        		if( $rootScope.getUnitFromDB($stateParams.unit_id) == 'undefined' || $rootScope.getUnitFromDB($stateParams.unit_id) == undefined ) {
        			setTimeout( tryUnitDB , 100 );
        		}
        		else {
        			$scope.unit = $rootScope.getUnitFromDB($stateParams.unit_id);
        		}
        	}
        	tryUnitDB();
        	
        }
        else {
            $state.go('home');    
        }
    }
    
})

.controller('UnitDashboardCtrl', function($rootScope, $scope, $ionicLoading, $state, $stateParams) {
    
    if (typeof $rootScope.players == 'undefined' || $rootScope.players.length == 0) {
        $state.go('home');
    }
    else {
        if($stateParams.unit_id != 'none') {
        	
        	function tryUnitDB() {
        		if( $rootScope.getUnitFromDB($stateParams.unit_id) == 'undefined' || $rootScope.getUnitFromDB($stateParams.unit_id) == undefined ) {
        			setTimeout( tryUnitDB , 100 );
        		}
        		else {
        			$scope.unit = $rootScope.getUnitFromDB($stateParams.unit_id);
        		}
        	}
        	tryUnitDB();

            if($stateParams.player_id != 'none') {
                $scope.player_id = $stateParams.player_id;   
            }
            else {
                $state.go('home');     
            }
        }
        else {    
            $state.go('home');    
        }
    }
    
})

.controller('UnitPickCtrl', function($rootScope, $scope, $ionicLoading, $state, $stateParams) {
    
    if (typeof $rootScope.players == 'undefined' || $rootScope.players.length == 0) {
        $state.go('home');
    }
    else {
        if($stateParams.unit_id != 'none') {
            $scope.unit = $rootScope.unitsDB[$stateParams.unit_id];
        }
        else {
            $state.go('home');
        }
    }
    
})

.controller('SettingsCtrl', function($rootScope, $scope, $ionicLoading, $state, $stateParams, $localStorage, Popup, $filter, $translate) {

    $scope.deleteAllSaves = function() {
		delete $localStorage.collection;
    	delete $localStorage.set_collection_count;
        delete $localStorage.sets;
        delete $localStorage.players;
    	delete $localStorage.gameMode;
    	delete $localStorage.gameManagerStep;
    	delete $localStorage.advertisePopup;
        delete $localStorage.nemesis_mode;
//    	$scope.collection = {};
//    	$scope.set_collection_count = {};
//    	$scope.sets = {};
//    	$rootScope.players = [];
//    	$rootScope.gameMode = 'normal';
//    	$rootScope.gameManagerStep = 'none';
    	Popup.simple($filter('translate')('popup_saveddataerased_title') , $filter('translate')('popup_saveddataerased_desc'));
    }
    
    $scope.changeUiLanguage = function(lang) {
    	$translate.use(lang);
    	$localStorage.ui_language = lang;
    	$rootScope.ui_language = lang;
    }
    
    $scope.changeContentLanguage = function(lang) {
    	$localStorage.language = lang;
    	$rootScope.language = lang;
    }

    $scope.changeNemesisDisplay = function(val) {
        $localStorage.nemesis_mode = val
        $rootScope.nemesis_mode = val
    }
    
	
})

.controller('TermsOfUseCtrl', function($rootScope, $scope, $ionicLoading, $state, $stateParams) {

    
})
    
.controller('GlossaryCtrl', function($rootScope, $scope, $ionicLoading, $state, $stateParams) {

    
})

.controller('PatchNotesCtrl', function($rootScope, $scope, $ionicLoading, $state, $stateParams) {

    
})

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider, $translateProvider) {
	
    // Désactive le scrolling js et laisse faire le scrolling natif
    // Utile pour le gain de performance
    $ionicConfigProvider.scrolling.jsScrolling(false);
    
    // Permet de décider combien de vues sont mise en cache, ici c'est un max de 3. Ionic sauvegarde la position de la page, etc.
    // Les vues avec cache : false dans les statesProviders ne sont pas mises en cache
    $ionicConfigProvider.views.maxCache(3);
    
    // Définition des chemins (états)
    $stateProvider.state('home', {
        url: '/home',
        templateUrl: 'templates/home.html',
        controller: 'HomeCtrl',
        cache: true,
        reload: false,
        onEnter: function(Isotope, $timeout){
        	
					        		var homeIso = false;
					        		
					        		var checkHomeIsotopeStatus = function() {
					        			if(Isotope.getIsotopeIsRunning('isoCollection')) {
					                        Isotope.canYouLaunch('isotopeContainer', 'isoCollection');
					                        ionic.DomUtil.ready(function () {
					                        	Isotope.getIsotope('isoCollection').imagesLoaded().progress(function() {
					                        		Isotope.reLayout('isoCollection');
					                        	});
//					                        	Isotope.getIsotope('isoCollection').on( 'arrangeComplete', function( laidOutItems ) {
//					                        		Isotope.reLayout('isoCollection');
//					                        	});
					                        	homeIso = true;
					                        	//Isotope.reLayout('isoCollection');
					                        });
					                    }
					        			else {
					        				if(homeIso == false) {
					        					$timeout(checkHomeIsotopeStatus, 500);
					        				}
					        			}
					        		}
					        		checkHomeIsotopeStatus();
					        		
              }
    });
    
    $stateProvider.state('game', {
        url: '/game',
        templateUrl: 'templates/game.html',
        controller: 'GameCtrl',
        cache: true,
        onEnter: function(Isotope, $timeout){
        			var gameIso = false;
        			
        			var checkGameIsotopeStatus = function() {
        			
	                    if(Isotope.getIsotopeIsRunning('isoPicks')) {
	                        Isotope.canYouLaunch('isotopeContainerPicks', 'isoPicks');
	                        ionic.DomUtil.ready(function () {
	                        	Isotope.getIsotope('isoPicks').imagesLoaded().progress(function() {
	                        		Isotope.reLayout('isoPicks');
	                        	});
	                        	gameIso = true;
	                        });
	                    }
	                    else {
	        				if(gameIso == false) {
	        					$timeout(checkGameIsotopeStatus, 500);
	        				}
	        			}
        			}
        			checkGameIsotopeStatus();
        			
                 }
    });
    
    $stateProvider.state('unit_pick', {
        url: '/unit_pick/:unit_id',
        cache: false,
        params: {
            unit_id : {
                value: 'none',
                squash: false
            }
        },
        templateUrl: 'templates/popups/unit_pick.html',
        controller: 'UnitPickCtrl'
    });
    
    $stateProvider.state('player_picks', {
        url: '/player_picks/:player_id',
        cache: false,
        params: {
            unit_id : {
                value: 'none',
                squash: false
            }
        },
        templateUrl: 'templates/popups/player_picks.html',
        controller: 'PlayerPicksCtrl'
    });
    
    $stateProvider.state('collection', {
        url: '/collection',
        templateUrl: 'templates/collection.html',
        controller: 'CollectionCtrl'
    });
    
    $stateProvider.state('unit', {
        url: '/unit/:unit_id',
        cache: false,
        params: {
            unit_id : {
                value: 'none',
                squash: false
            }
        },
        templateUrl: 'templates/popups/unit.html',
        controller: 'UnitCtrl'
    });
    
    $stateProvider.state('unit_dashboard', {
        url: '/unit_dashboard/:unit_id',
        cache: false,
        params: {
            unit_id : {
                value: 'none',
                squash: false
            },
            player_id : {
                value: 'none',
                squash: false
            }
        },
        templateUrl: 'templates/popups/unit_dashboard.html',
        controller: 'UnitDashboardCtrl'
    });
    
    $stateProvider.state('settings', {
        url: '/settings',
        cache: false,
        templateUrl: 'templates/settings.html',
        controller: 'SettingsCtrl'
    });
    
    $stateProvider.state('termsofuse', {
        url: '/termsofuse',
        cache: false,
        templateUrl: 'templates/termsofuse.html',
        controller: 'TermsOfUseCtrl'
    });
    
    $stateProvider.state('patchnotes', {
        url: '/patchnotes',
        templateUrl: 'templates/patchnotes.html',
        controller: 'PatchNotesCtrl'
    });
    
    $stateProvider.state('glossary', {
        url: '/glossary',
        cache: false,
        templateUrl: 'templates/glossary.html',
        controller: 'GlossaryCtrl'
    });
    
    // S'il n'y a rien dans l'url, le chemin par défaut sera celui de l'accueil
    $urlRouterProvider.otherwise('/home');
   
    // Définition des traductions
    $translateProvider.translations('en', {
    	app_name: "Tools for Mythic Battles",
    	menu_menu: "Menu",
    	menu_main_menu: "Main Menu",
    	menu_glossary: "Glossary",
    	menu_game_manager: "Game Manager",
    	menu_collection_manager: "Collection Manager",
    	menu_settings: "Settings",
    	menu_terms_of_use: "Terms of use",
    	menu_patch_notes: "Patch Notes",
    	menu_exit: "Exit",
    	menu_playerpicks: "Player's picks",
    	menu_unitdetails: "Unit Details",
    	menu_unitpick: "Unit Pick",
    	menu_unitdashboard: "Unit Dashboard",
        menu_buymecoffee: "Buy me a coffee",
    	filters_collection_browser: "Collection",
    	filters_recruitment_cost: "Recruitment Cost",
    	filters_unit_type: "Unit Type",
    	filters_sort_by: "Sort by",
    	filters_search: "Search",
    	filters_asc: "Asc.",
    	filters_desc: "Desc.",
    	filters_keywords: "Keywords",
    	filters_all: "All",
    	filters_name: "Name",
    	filters_cost: "Cost",
    	filters_activation: "Activation",
    	filters_aow: "AoW",
    	general_titan: "Titan",
    	general_god: "God",
    	general_hero: "Hero",
    	general_monster: "Monster",
    	general_troop: "Troop",
    	general_titans: "Titans",
    	general_gods: "Gods",
    	general_heroes: "Heroes",
    	general_monsters: "Monsters",
    	general_troops: "Troops",
    	general_attack: "Offense",
    	general_defense: "Defence",
    	general_range: "Range",
    	general_movement: "Movement",
    	general_power: "Power(s)",
    	general_vitality: "Vitality",
    	general_omphalos: "Omphalos",
    	general_units: "Units",
    	general_defeated: "Defeated",
    	general_recruitmentcost: "Recruitment Cost",
    	general_activationcards: "Activation cards",
    	general_aowcards: "Art of War cards",
    	general_figures: "Minis",
    	general_talents: "Talents",
    	general_powers: "Powers",
    	home_newgame: "Start a new game",
    	home_warning_1: "It looks like you haven't built your Mythic Battles collection yet.",
    	home_warning_2: "Before starting a game, you must tell the app which Titans, Gods, Heroes, Monsters and Troops you own in your collection.",
    	glossary_dashboard_icons: "Dashboard Icons",
    	glossary_talents: "Talents",
    	game_warning_1: "Please click on ",
    	game_warning_2: " button to start adding new players in the proper pick order (i.e. \"Z\" form for 4 players as specified in the manual if you want to play with the original game rules, etc.).",
    	game_warning_3: "Once you have added at least 2 players (Human or Nemesis), two game modes will be proposed to you : Normal Game and Custom Game.",
    	game_mode_normal_title: "Normal Game",
    	game_mode_normal_desc: "In this mode, you play with the original skirmish game rules. 4 players maximum with a draft limited to the RP they have at start.",
    	game_mode_normal_button: "Start a Normal Game",
    	game_mode_custom_title: "Nemesis Mode / Custom Game",
    	game_mode_custom_desc: "This is the mode for solo play, custom scenarios and house rules. Here you can add up to 20 players. They all have infinite recruitment points and can recruit as many gods, titans and other units they want.",
    	game_mode_custom_desc_2: "Though, you have to manually pass every step : next player pick, gods and titans picks, units recruitment, etc.",
    	game_mode_custom_button: "Start a Custom Game",
    	game_units_list: "Units list",
    	game_button_nextplayer: "Next player",
    	game_button_godspicks: "Proceed to Gods and Titans picks",
    	game_button_unitsrecruitment: "Proceed to Units recruitment",
    	game_button_endofrecruitment: "End of recruitment phase",
    	playerpicks_title: "starts with {{cards}} cards",
    	playerpicks_summary_activation: "Activation Card(s)",
    	playerpicks_summary_aow: "Art of War Card(s)",
    	playerpicks_summary_omphalos: "Omphalos Card(s)",
    	unitpick_alreadypicked: "This Unit has already been picked.",
    	unitpick_pickthisunit: "Pick this Unit",
    	collection_warning: "You can't manage your collection when a game is running. If you still want to modify it, please cancel the game in the Game Manager.",
    	collection_checkall: "Select all / Reverse selection",
    	settings_saveddatatext: "If you need to remove the saved data from your device, use the button below.",
    	settings_saveddatabutton: "Remove saved data",
    	settings_userinterfacetranslation: "User Interface Translation",
    	settings_contenttranslation: "Game Content Translation",
    	settings_restartrequired: "Requires the application restart to take effect",
    	popup_button_add: "Add",
    	popup_button_cancel: "Cancel",
    	popup_button_yes: "Yes",
    	popup_button_no: "No",
    	popup_button_ok: "Ok",
    	popup_addplayer_playername: "Player name",
    	popup_addplayer_desc: "Enter the name of this player",
    	popup_pickphase1_title: "Gods pick phase",
    	popup_pickphase1_desc: "Do you want to generate a randomized pool of Gods and Titans ? In that case, use the rulers below to set the amount of Gods and Titans you want and click \"Yes\". The SEED code is the base used to randomize the units pools. Share it with other players if you want to get the same randomized lists.",
    	popup_turns_gods: "It's your turn to pick a God or a Titan.",
    	popup_pickphase2_title: "Units pick phase",
    	popup_pickphase2_desc: "Do you want to generate a randomized pool of selectable units ? In that case, use the rulers below to set the amount of units you want for each type and click \"Yes\".",
    	popup_turns_units: "It's your turn to pick a unit. You have {{rp}} remaining Recruitment Points.",
    	popup_pickphase3_title: "Pick phase is over",
    	popup_pickphase3_desc: "All players have spent their recruitment points. You can overview each player's picks and manage every unit's vitality by interacting with their dashboards.",
    	popup_cantrecruit_title: "You can't recruit this unit !",
    	popup_cantrecruit_desc: "You don't have enough recruitment points.",
    	popup_cantrecruit_anymore: "You don't have enough points to recruit any of the available units. You will receive {{omphalos_cards}} omphalos card(s).",
    	popup_cancelgame_title: "Cancel Game",
    	popup_cancelgame_desc: "Are you sure you want to cancel the current game ?",
    	popup_savegame_title: "Game Saved",
    	popup_savegame_desc: "The game has been saved successfully.",
    	popup_collectionsaved_title: "Collection saved",
    	popup_collectionsaved_desc: "Your collection has been saved successfully.",
    	popup_saveddataerased_title: "Saved data erased",
    	popup_saveddataerased_desc: "Your saved data have been cleared successfully. You may need to restart the app to apply it.",
    	popup_temporarypick_title: "Generate Units pool",
    	popup_temporarypick_desc: "You can generate a list of units by using the rulers below. It will help you choose the Gods you want according to the available units. You will still have the opportunity to generate another units list after you pick the Gods. Do you want to generate a randomized pool of units ?",
    	units_temp_title: "Units that will be available for recruitment",
        nemesis_mode : "Nemesis Mode",
        settings_nemesismodedisplay: 'Display Nemesis Mode infos'
    });
    $translateProvider.translations('fr', {
    	app_name: "Outils pour Mythic Battles",
    	menu_menu: "Menu",
    	menu_main_menu: "Menu Principal",
    	menu_glossary: "Glossaire",
    	menu_game_manager: "Gestion de Partie",
    	menu_collection_manager: "Collection",
    	menu_settings: "Reglages",
    	menu_terms_of_use: "Conditions d'Utilisation",
    	menu_patch_notes: "Notes de Patch",
    	menu_exit: "Exit",
    	menu_playerpicks: "Unités du joueur",
    	menu_unitdetails: "Détails de l'Unité",
    	menu_unitpick: "Sélection d'Unité",
    	menu_unitdashboard: "Plateau de jeu de l'Unité",
        menu_buymecoffee: "Offrez-moi un cafe",
    	filters_collection_browser: "Collection",
    	filters_recruitment_cost: "Coût de Recrutement",
        filters_unit_type: "Type d'unité",
        filters_sort_by: "Trier par",
        filters_search: "Rechercher",
    	filters_asc: "Asc.",
    	filters_desc: "Desc.",
    	filters_keywords: "Mots clés",
    	filters_all: "Tous",
    	filters_name: "Nom",
    	filters_cost: "Coût",
    	filters_activation: "Activation",
    	filters_aow: "AoW",
    	general_titan: "Titan",
    	general_god: "Dieu",
    	general_hero: "Héros",
    	general_monster: "Monstre",
    	general_troop: "Troupe",
    	general_titans: "Titans",
    	general_gods: "Dieux",
    	general_heroes: "Héros",
    	general_monsters: "Monstres",
    	general_troops: "Troupes",
    	general_attack: "Combat",
    	general_defense: "Défense",
    	general_range: "Portée",
    	general_movement: "Mouvement",
    	general_power: "Pouvoir(s)",
    	general_vitality: "Vitalité",
    	general_omphalos: "Omphalos",
    	general_units: "Unités",
    	general_defeated: "Elimine",
    	general_recruitmentcost: "Coût de Recrutement",
    	general_activationcards: "Cartes Activation",
    	general_aowcards: "Cartes Art de la Guerre",
    	general_figures: "Figurines",
    	general_talents: "Talents",
    	general_powers: "Pouvoirs",
    	home_newgame: "Nouvelle partie",
    	home_warning_1: "Il semblerait que votre collection Mythic Battles soit vide.",
    	home_warning_2: "Avant de lancer une partie, vous devez indiquer à l'application quels Titans, Dieux, Héros, Monstres et Troupes vous possédez dans votre collection.",
		glossary_dashboard_icons: "Icones des Plateaux de Jeu",
    	glossary_talents: "Talents",
    	game_warning_1: "Cliquez sur le bouton ",
    	game_warning_2: " pour ajouter de nouveaux joueurs dans l'ordre désiré (par exemple en forme de \"Z\" à 4 joueurs, comme spécifié dans le manuel du jeu si vous voulez utiliser les règles originales, etc.).",
    	game_warning_3: "Une fois que vous aurez ajouté au moins deux joueurs (Humain ou Nemesis), deux modes de jeu vous seront proposés : Normal et Personnalisé.",
    	game_mode_normal_title: "Partie Normale",
    	game_mode_normal_desc: "Dans ce mode, vous jouez avec les règles originales du jeu en escarmouche. 4 joueurs maximum avec un draft limité aux RP (points de recrutement) qu'ils ont au départ.",
    	game_mode_normal_button: "Lancer une partie normale",
    	game_mode_custom_title: "Mode Nemesis / Partie Personnalisée",
    	game_mode_custom_desc: "C'est le mode à privilégier pour jouer en solo, faire des scénarios personnalisés ou jouer avec des règles maisons. Vous pouvez ajouter jusqu'à 20 joueurs. Ils ont tous des points de recrutement infinis et peuvent recruter autant de dieux, titans et autres qu'ils veulent.",
    	game_mode_custom_desc_2: "En contrepartie, vous devrez passer chaque étape du draft manuellement : passer la main au joueur suivant, passer à la phase de sélection des dieux et titans, à la phase de recrutement des unités, etc.",
    	game_mode_custom_button: "Lancer une partie personnalisée",
    	game_units_list: "Liste des Unites",
    	game_button_nextplayer: "Joueur suivant",
    	game_button_godspicks: "Procéder à la sélection des Dieux",
    	game_button_unitsrecruitment: "Procéder au recrutement des Unités",
    	game_button_endofrecruitment: "Fin de la phase de sélection",
    	playerpicks_title: "commence avec {{cards}} cartes",
    	playerpicks_summary_activation: "Carte(s) Activation",
    	playerpicks_summary_aow: "Carte(s) Art de la Guerre",
    	playerpicks_summary_omphalos: "Carte(s) Omphalos",
    	unitpick_alreadypicked: "Cette Unité a déjà été sélectionnée.",
    	unitpick_pickthisunit: "Choisir cette Unité",
    	collection_warning: "Vous ne pouvez gérer votre collection quand une partie est en cours. Si vous tenez tout de même à la modifier, veuillez annuler la partie en cours sur l'écran de gestion des parties.",
    	collection_checkall: "Sélectionner tout / Inverser la sélection",
    	settings_saveddatatext: "Si vous souhaitez supprimer les données sauvegardées sur votre appareil, veuillez utiliser le bouton ci-dessous.",
    	settings_saveddatabutton: "Supprimer les données",
    	settings_userinterfacetranslation: "Traduction de l'interface utilisateur",
    	settings_contenttranslation: "Traduction du contenu du jeu",
    	settings_restartrequired: "Le redémarrage de l'application est requis pour que la modification fasse effet",
    	popup_button_add: "Ajouter",
    	popup_button_cancel: "Annuler",
    	popup_button_yes: "Oui",
    	popup_button_no: "Non",
    	popup_addplayer_playername: "Nom du joueur",
    	popup_addplayer_desc: "Entrez le nom de ce joueur",
    	popup_pickphase1_title: "Phase de sélection des Dieux",
    	popup_pickphase1_desc: "Souhaitez-vous générer une liste aléatoire de Dieux et de Titans ? Si oui, utilisez les réglettes ci-dessous pour ajuster le nombre de Dieux et de Titans que vous voulez et cliquez sur \"Oui\". Le code SEED est la base utilisée pour générer les pools aléatoires d'unités. Partagez-le avec d'autres joueurs si vous souhaitez obtenir les mêmes listes aléatoires.",
    	popup_turns_gods: "C'est à vous de choisir un Dieu ou un Titan.",
    	popup_pickphase2_title: "Phase de sélection des unités",
    	popup_pickphase2_desc: "Souhaitez-vous générer une liste aléatoire d'unités ? Si oui, utilisez les réglettes ci-dessous pour ajuster le nombre d'unités de chaque type que vous voulez et cliquez sur \"Oui\".",
    	popup_turns_units: "C'est à votre tour de choisir une unité. Il vous reste {{rp}} Points de Recrutement.",
    	popup_pickphase3_title: "La phase de sélection est terminée",
    	popup_pickphase3_desc: "Tous les joueurs ont dépensé leurs points de recrutement. Vous pouvez inspecter les fiches de chaque joueur et gérer la santé de chacune des unités en intéragissant avec leur plateau de jeu.",
    	popup_cantrecruit_title: "Vous ne pouvez pas recruter cette Unité !",
    	popup_cantrecruit_desc: "Vous n'avez pas assez de Points de Recrutement.",
    	popup_cantrecruit_anymore: "Vous n'avez plus assez de Points de Recrutement pour les unités restantes. Vous recevez {{omphalos_cards}} carte(s) Omphalos.",
    	popup_cancelgame_title: "Annuler la Partie",
    	popup_cancelgame_desc: "Etes-vous sûr de vouloir annuler la partie en cours ?",
    	popup_savegame_title: "Partie Sauvegardée",
    	popup_savegame_desc: "La partie a été sauvegardée avec succès.",
    	popup_collectionsaved_title: "Collection sauvegardée",
    	popup_collectionsaved_desc: "Votre collection a été sauvegardée avec succès.",
    	popup_saveddataerased_title: "Sauvegarde effacée",
    	popup_saveddataerased_desc: "Vos données ont été effacées avec succès. Vous devez relancer l'application pour que la suppression des données prennent pleinement effet.",
    	popup_temporarypick_title: "Générer une liste d'unités aléatoire",
    	popup_temporarypick_desc: "Vous pouvez générer une liste d'unités en utilisant les réglettes ci-dessous. Ca vous aidera à choisir les Dieux en fonction des unités disponibles. Vous aurez tout de même la possibilité de générer une autre liste d'unités après avoir choisi les Dieux. Souhaitez-vous générer une liste d'unités aléatoire ?",						  	
    	units_temp_title: "Unités qu'il sera possible de recruter",
        nemesis_mode : "Mode Nemesis",
        settings_nemesismodedisplay: 'Afficher les infos du mode Nemesis'
    });
    $translateProvider.translations('es', {
    	app_name: "Herramientas para Mythic Battles",
    	menu_menu: "Menú",
    	menu_main_menu: "Menu Principal",
    	menu_glossary: "Glosario",
    	menu_game_manager: "Gestor de Juego",
    	menu_collection_manager: "Gestor de Coleccion",
    	menu_settings: "Ajustes",
    	menu_terms_of_use: "Terminos de uso",
    	menu_patch_notes: "Notas del Parche",
    	menu_exit: "Salir",
    	menu_playerpicks: "Selecciones del jugador",
    	menu_unitdetails: "Detalles de la Unidad",
    	menu_unitpick: "Unidad Seleccionada",
    	menu_unitdashboard: "Ficha de Unidad",
        menu_buymecoffee: "Buy me a coffee",
    	filters_collection_browser: "Coleccion",
    	filters_recruitment_cost: "Coste de Reclutamiento",
    	filters_unit_type: "Tipo de Unidad",
    	filters_sort_by: "Ordenar por",
    	filters_search: "Buscar",
    	filters_asc: "Asc.",
    	filters_desc: "Desc.",
    	filters_keywords: "Palabra clave",
    	filters_all: "Todo",
    	filters_name: "Nombre",
    	filters_cost: "Coste",
    	filters_activation: "Activación",
    	filters_aow: "AoW",
    	general_titan: "Titán",
    	general_god: "Dios",
    	general_hero: "Héroe",
    	general_monster: "Monstruo",
    	general_troop: "Tropa",
    	general_titans: "Titanes",
    	general_gods: "Dioses",
    	general_heroes: "Héroes",
    	general_monsters: "Monstruos",
    	general_troops: "Tropas",
    	general_attack: "Ataque",
    	general_defense: "Defensa",
    	general_range: "Alcance",
    	general_movement: "Movimiento",
    	general_power: "Poder(es)",
    	general_vitality: "Vitalidad",
    	general_omphalos: "Omphalos",
    	general_units: "Unidades",
    	general_defeated: "Derrotado",
    	general_recruitmentcost: "Coste de Reclutamiento",
    	general_activationcards: "Cartas de Activación",
    	general_aowcards: "Cartas de Art of War",
    	general_figures: "Minis",
    	general_talents: "Talentos",
    	general_powers: "Poderes",
    	home_newgame: "Empezar una partida nueva",
    	home_warning_1: "Parece que aún no has hecho tu colección de Mythic Battles.",
    	home_warning_2: "Antes de empezar una partida, debes indicarle a la app qué Titanes, Dioses, Héroes, Monstruos y Tropas tienes en tu colección.",
    	glossary_dashboard_icons: "Iconos de Ficha",
    	glossary_talents: "Talentos",
    	game_warning_1: "Por favor pulsa el botón ",
    	game_warning_2: " para añadir nuevos jugadores para un correcto orden de selección.",
    	game_warning_3: "Una vez hayas añadido al menos 2 jugadores, se propondrán dos modos de juego : Partida Normal y Partida Personalizada.",
    	game_mode_normal_title: "Partida Normal",
    	game_mode_normal_desc: "En este modo, jugarás con las reglas originales de escaramuza. 4 jugadores máximo con una selección limitada por los PR que tengan al empezar.",
    	game_mode_normal_button: "Empezar una Partida Normal",
    	game_mode_custom_title: "Nemesis Mode / Partida Personalizada",
    	game_mode_custom_desc: "Este es el modo para jugar en solitario, escenarios personalizados y reglas caseras. Aquí podrás añadir hasta 20 jugadores. Todos ellos dispondrán de puntos de reclutamiento infinitos y podrán reclutar tantos dioses, titanes y demás unidades como quieran.",
    	game_mode_custom_desc_2: "Aunque, tendrás que realizar manualmente cada paso : siguiente elección del jugador, dioses y titanes seleccionados, unidades reclutadas, etc.",
    	game_mode_custom_button: "Empezar una Partida Personalizada",
    	game_units_list: "Lista de unidades",
    	game_button_nextplayer: "Siguiente jugador",
    	game_button_godspicks: "Seleccionar Dioses y Titanes",
    	game_button_unitsrecruitment: "Reclutar Unidades",
    	game_button_endofrecruitment: "Fin de la fase de reclutamiento",
    	playerpicks_title: "empieza con {{cards}} las cartas",
    	playerpicks_summary_activation: "Carta(s) de Activación",
    	playerpicks_summary_aow: "Carta(s) de Art of War",
    	playerpicks_summary_omphalos: "Carta(s) de Omphalos",
    	unitpick_alreadypicked: "Esta Unidad ya ha sido seleccionada.",
    	unitpick_pickthisunit: "Seleccionar esta Unidad",
    	collection_warning: "No podrás gestionar tu colección mientras una partida esté en curso. Si aún así quisieras modificarla, por favor cancela la partida desde el Gestor de Juego.",
    	collection_checkall: "Seleccionar todo / Selección inversa",
    	settings_saveddatatext: "Si necesitas borrar los datos salvados de tu dispositivo, usa el botón de abajo.",
    	settings_saveddatabutton: "Borrar datos salvados",
    	settings_userinterfacetranslation: "Traducción de Interfaz de Usuario",
    	settings_contenttranslation: "Traducción de Contenido del Juego",
    	settings_restartrequired: "Requiere el reinicio de la aplicación para surtir efecto",
    	popup_button_add: "Añadir",
    	popup_button_cancel: "Cancelar",
    	popup_button_yes: "Sí",
    	popup_button_no: "No",
    	popup_button_ok: "Ok",
    	popup_addplayer_playername: "Nombre del jugador",
    	popup_addplayer_desc: "Introducir el nombre de este jugador",
    	popup_pickphase1_title: "Fase de selección de Dioses",
    	popup_pickphase1_desc: "¿Quieres generar una selección aleatoria de Dioses y Titanes? En ese caso, usa las reglas de abajo para fijar la cantidad de Dioses y Titanes que quieras y pulsa \"Sí\". El código SEED es la base utilizada para elegir aleatoriamente las unidades de los equipos. Compártelo con otros jugadores si quieres usar las mismas listas aleatorias.",
    	popup_turns_gods: "Es tu turno para seleccionar un Dios o un Titán.",
    	popup_pickphase2_title: "Fase de selección de Unidades",
    	popup_pickphase2_desc: "¿Quieres generar un grupo aleatorio de unidades seleccionables? En ese caso, usa las reglas de abajo para fijar la cantidad de unidades que quieras de cada tipo y pulsa \"Sí\".",
    	popup_turns_units: "Es tu turno para seleccionar una unidad. Tienes {{rp}} Puntos de Reclutamiento restantes.",
    	popup_pickphase3_title: "Fase de selección terminada",
    	popup_pickphase3_desc: "Todos los jugadores han gastado sus puntos de reclutamiento. Podrás visualizar las selecciones de cada jugador y gestionar la vitalidad de todas las unidades interactuando con sus fichas.",
    	popup_cantrecruit_title: "¡No puedes reclutar esta unidad!",
    	popup_cantrecruit_desc: "No tienes suficientes puntos de reclutamiento.",
    	popup_cantrecruit_anymore: "No tienes suficientes puntos para reclutar alguna de las unidades disponibles. Recibirás {{omphalos_cards}} carta(s) de omphalos.",
    	popup_cancelgame_title: "Cancelar Partida",
    	popup_cancelgame_desc: "¿Estás seguro de que quieres cancelar la partida actual?",
    	popup_savegame_title: "Partida Salvada",
    	popup_savegame_desc: "La partida ha sido salvada correctamente.",
    	popup_collectionsaved_title: "Colección salvada",
    	popup_collectionsaved_desc: "Tu colección ha sido salvada correctamente.",
    	popup_saveddataerased_title: "Datos guardados borrados",
    	popup_saveddataerased_desc: "Tus datos salvados han sido eliminados correctamente. Necesitarás reiniciar la app para que surta efecto.",
    	popup_temporarypick_title: "Crear grupo de Unidades",
    	popup_temporarypick_desc: "Puedes crear una lista de Unidades usando las reglas de abajo. Te ayudará a elegir los Dioses que quieras según las Unidades disponibles. Incluso después de haber elegido un Dios tendrás la oportunidad de crear una lista de Unidades. ¿Quieres crear de forma aleatoria un grupo de Unidades?",
    	units_temp_title: "Unidades disponibles para reclutar",
        nemesis_mode : "Nemesis Mode",
        settings_nemesismodedisplay: 'Display Nemesis Mode infos'
    });
    $translateProvider.useSanitizeValueStrategy('escape');
    $translateProvider.preferredLanguage("en");
    $translateProvider.fallbackLanguage("en");
      
})

.factory(
    "preloader",
    function( $q, $rootScope ) {
        // I manage the preloading of image objects. Accepts an array of image URLs.
        function Preloader( imageLocations ) {
            // I am the image SRC values to preload.
            this.imageLocations = imageLocations;
            // As the images load, we'll need to keep track of the load/error
            // counts when announing the progress on the loading.
            this.imageCount = this.imageLocations.length;
            this.loadCount = 0;
            this.errorCount = 0;
            // I am the possible states that the preloader can be in.
            this.states = {
                PENDING: 1,
                LOADING: 2,
                RESOLVED: 3,
                REJECTED: 4
            };
            // I keep track of the current state of the preloader.
            this.state = this.states.PENDING;
            // When loading the images, a promise will be returned to indicate
            // when the loading has completed (and / or progressed).
            this.deferred = $q.defer();
            this.promise = this.deferred.promise;
        }
        // ---
        // STATIC METHODS.
        // ---
        // I reload the given images [Array] and return a promise. The promise
        // will be resolved with the array of image locations.
        Preloader.preloadImages = function( imageLocations ) {
            var preloader = new Preloader( imageLocations );
            return( preloader.load() );
        };
        // ---
        // INSTANCE METHODS.
        // ---
        Preloader.prototype = {
            // Best practice for "instnceof" operator.
            constructor: Preloader,
            // ---
            // PUBLIC METHODS.
            // ---
            // I determine if the preloader has started loading images yet.
            isInitiated: function isInitiated() {
                return( this.state !== this.states.PENDING );
            },
            // I determine if the preloader has failed to load all of the images.
            isRejected: function isRejected() {
                return( this.state === this.states.REJECTED );
            },
            // I determine if the preloader has successfully loaded all of the images.
            isResolved: function isResolved() {
                return( this.state === this.states.RESOLVED );
            },
            // I initiate the preload of the images. Returns a promise.
            load: function load() {
                // If the images are already loading, return the existing promise.
                if ( this.isInitiated() ) {
                    return( this.promise );
                }
                this.state = this.states.LOADING;
                for ( var i = 0 ; i < this.imageCount ; i++ ) {
                    this.loadImageLocation( this.imageLocations[ i ] );
                }
                // Return the deferred promise for the load event.
                return( this.promise );
            },
            // ---
            // PRIVATE METHODS.
            // ---
            // I handle the load-failure of the given image location.
            handleImageError: function handleImageError( imageLocation ) {
                this.errorCount++;
                // If the preload action has already failed, ignore further action.
                if ( this.isRejected() ) {
                    return;
                }
                this.state = this.states.REJECTED;
                this.deferred.reject( imageLocation );
            },
            // I handle the load-success of the given image location.
            handleImageLoad: function handleImageLoad( imageLocation ) {
                this.loadCount++;
                // If the preload action has already failed, ignore further action.
                if ( this.isRejected() ) {
                    return;
                }
                // Notify the progress of the overall deferred. This is different
                // than Resolving the deferred - you can call notify many times
                // before the ultimate resolution (or rejection) of the deferred.
                this.deferred.notify({
                    percent: Math.ceil( this.loadCount / this.imageCount * 100 ),
                    imageLocation: imageLocation
                });
                // If all of the images have loaded, we can resolve the deferred
                // value that we returned to the calling context.
                if ( this.loadCount === this.imageCount ) {
                    this.state = this.states.RESOLVED;
                    this.deferred.resolve( this.imageLocations );
                }
            },
            // I load the given image location and then wire the load / error
            // events back into the preloader instance.
            // --
            // NOTE: The load/error events trigger a $digest.
            loadImageLocation: function loadImageLocation( imageLocation ) {
                var preloader = this;
                // When it comes to creating the image object, it is critical that
                // we bind the event handlers BEFORE we actually set the image
                // source. Failure to do so will prevent the events from proper
                // triggering in some browsers.
                var image = $( new Image() )
                    .load(
                        function( event ) {
                            // Since the load event is asynchronous, we have to
                            // tell AngularJS that something changed.
                            $rootScope.$apply(
                                function() {
                                    preloader.handleImageLoad( event.target.src );
                                    // Clean up object reference to help with the
                                    // garbage collection in the closure.
                                    preloader = image = event = null;
                                }
                            );
                        }
                    )
                    .error(
                        function( event ) {
                            // Since the load event is asynchronous, we have to
                            // tell AngularJS that something changed.
                            $rootScope.$apply(
                                function() {
                                    preloader.handleImageError( event.target.src );
                                    // Clean up object reference to help with the
                                    // garbage collection in the closure.
                                    preloader = image = event = null;
                                }
                            );
                        }
                    )
                    .prop( "src", imageLocation )
                ;
            }
        };
        // Return the factory instance.
        return( Preloader );
    }
);


    


