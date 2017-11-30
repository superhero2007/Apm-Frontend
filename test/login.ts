(function($) {
    (<any>$).QueryString = (function(a:any) {
        if (a == "") return {};
        var b = {};
        for (var i = 0; i < a.length; ++i)
        {
            var p=a[i].split('=');
            if (p.length != 2) continue;
            b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
        }
        return b;
    })(window.location.search.substr(1).split('&'))
})(jQuery);

function showErrorMsg(elemId:string, errorMsg:string, btnId:string)
{
    $(elemId)[0].style.display = 'block';
    $(elemId).text(errorMsg);
    $(btnId).removeAttr('disabled');
}

$(function () {

    var URL_RESTSVR ='http://localhost:8080/rest/';
    const params = new URLSearchParams(window.location.search);
	const profile = params.get("profile");
	if(profile == "devprod")
    {
	    URL_RESTSVR ='https://apmgui.dripstat.com/rest/';
    }

   console.log("using rest server: "+URL_RESTSVR);

    $('#loginform').submit(function (e) {

        e.preventDefault(); //STOP default action


        var postData = $(this).serialize();
        var formURL =  URL_RESTSVR + 'login';

        $('#loginBtn').attr('disabled','disabled');

        $.ajax(
            {
                url: formURL,
                type: "POST",
                data: postData,
                xhrFields: {
                    withCredentials: true
                },
                success: function (data, textStatus, jqXHR) {
                    //data: return data from server

                    var masterParam = "";
                    if(data == "isMasterUser")
                        masterParam = "?isMasterUser=true";
                    window.location.replace("http://localhost:" +window.location.port + "/index.html"+masterParam);
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    //if fails
                    showErrorMsg('#loginError',jqXHR.responseText, '#loginBtn');
                }
            });

    });


    $('#signupForm').submit(function (e) {

        e.preventDefault(); //STOP default action

        var postData = $(this).serialize();
        var formURL = URL_RESTSVR + 'signup';

        $('#signupBtn').attr('disabled','disabled');

        $.ajax(
            {
                url: formURL,
                type: "POST",
                data: postData,
                xhrFields: {
                    withCredentials: true
                },
                success: function (data, textStatus, jqXHR) {
                    //data: return data from server
                    window.location.replace("http://localhost:63342/apmfrontend/app/index.html");
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    //if fails
                    showErrorMsg('#signupError',JSON.parse(jqXHR.responseText), '#signupBtn');
                }
            });

    });


    $('#resetpassform').submit(function (e) {

        e.preventDefault(); //STOP default action


        var postData = $(this).serialize() + "&sptoken="+sptoken;
        var formURL = URL_RESTSVR + 'changepassword';
        console.log("submit " + postData);

        $.ajax(
            {
                url: formURL,
                type: "POST",
                data: postData,
                xhrFields: {
                    withCredentials: true
                },
                success: function (data, textStatus, jqXHR) {
                    //data: return data from server
                    window.location.replace("http://localhost:63342/apmserver/webui/app/index.html");
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    //if fails
                    console.log("error " + jqXHR.responseText);
                }
            });

    });

    var sptoken = (<any>$).QueryString["sptoken"];
});
