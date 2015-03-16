let apiRoot = 'https://rmg-prod.apigee.net/v1/binary';

function authorize() {
    var loginUrl = apiRoot `/oauth/authorize
		?response_type=token
		&client_id=ldqAtjU9Vj8xojmK0awwOerdIDvQlyWH
        &scope=S111
        &state=fjcapp01`;
    var authWindow = window.open(loginUrl, '_blank', 'clearcache=yes,clearsessioncache=yes,location=no,toolbar=no');
    $(authWindow).on('loadstart', function(e) {
        var url = e.originalEvent.url;
        console.log('testing received url now!' + url);
        var matches = /[&\?]access_token=(.+)$/.exec(url);
        g.access_token = matches[1];
        if (g.access_token) {
            ajax_call.headers = {
                Authorization: 'Bearer ' + g.access_token
            };
            window.localStorage.setItem("access_token", g.access_token);
            authWindow.close();
            api_is_good();
        }
    });
}

function quote_or_buy(http_method) {
    if (!g.symbol) {
        alert('Pick a Market Symbol First!');
        return;
    }
    $.mobile.loading("show");
    var sym = g.symbol.replace(/\//g, '-');
    var contract_type = $('#p5 input[name="contract-type"]:checked').val();
    var duration = $('#p5 #duration').val() * 60;
    var payout = $('#p5 #payout').val();
    ajax_call.url = proxy_site + '/contract/' + contract_type + '/' + sym + '/sec/' + duration + '/USD/' + payout + '/0/0/0';
    ajax_call.type = http_method;
    $.ajax(ajax_call)
        .done(ajax_done)
        .fail(ajax_fail)
        .always(ajax_always);
}

function quote() {
    quote_or_buy('GET');
}

function buy() {
    quote_or_buy('POST');
}

export function markets() {
    return fetch(apiRoot + '/markets', {
        mode: 'cors'
    });
}

export function account() {
    return fetch(apiRoot + '/account', {
        mode: 'cors'
    });
}

export function portfolio() {
    return fetch(apiRoot + '/portfolio', {
        mode: 'cors'
    });
}

export function symbols(sym) {
    return fetch(apiRoot + '/offerings?contract_category=Rise%2FFall&is_forward_starting=N&expiry_type=intraday', {
        mode: 'cors'
    });
}

export function symbol(sym) {
    return fetch(apiRoot + '/symbols/' + sym.replace(/\//g, '-'), {
        mode: 'cors'
    });
}
