function errorLocation(msg) {
    console.log(msg);
}

function successLocation(position) {
    var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({'latLng': latlng}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            var result = results[0];
            //look for locality tag and administrative_area_level_1
            var city = "";
            for(var i=0, len=result.address_components.length; i<len; i++) {
                var ac = result.address_components[i];
                if(ac.types.indexOf("locality") >= 0) city = ac.long_name;
            }

            //only report if we got Good Stuff
            if(city != '' && state != '') {
                $('#location-input').val(city);
            }
        }
    });
}

if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(successLocation, errorLocation);
}


