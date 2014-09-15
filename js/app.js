
var g = {
	submarkets: {}
};

var proxy_site = 'https://rmg-prod.apigee.net/v1/binary';

var ajax_call = { cache: false };

function pad0(v) {if (v>=10) return v; return '0'+v}
function datetime_str(epoch) {
	var d = new Date(1000 * epoch);
	var datestr = $.datepicker.formatDate('dd-M-yy', d);
	var timestr = pad0(d.getHours()) + ':' + pad0(d.getMinutes()) + ':' + pad0(d.getSeconds());
	return timestr + ' ' + datestr;
}
function time_str(epoch) {
	var d = new Date(1000 * epoch);
	return pad0(d.getHours()) + ':' + pad0(d.getMinutes()) + ':' + pad0(d.getSeconds());
}
function date_str(epoch) {
	return $.datepicker.formatDate('dd-M-yy', new Date(1000 * epoch))
}

function authorize() {
	var login_url = proxy_site
					+ '/oauth/authorize'
					+ '?response_type=token'
					+ '&client_id=ldqAtjU9Vj8xojmK0awwOerdIDvQlyWH'
					+ '&scope=S111'
					+ '&state=fjcapp01';
	var authWindow = window.open(login_url, '_blank', 'clearcache=yes,clearsessioncache=yes,location=no,toolbar=no');
	$(authWindow).on('loadstart', function(e) {
		var url = e.originalEvent.url;
		console.log('testing received url now!' + url);
		var matches = /[&\?]access_token=(.+)$/.exec(url);
		g.access_token = matches[1];
		if (g.access_token) {
			ajax_call.headers = { Authorization: 'Bearer ' + g.access_token };
			window.localStorage.setItem("access_token", g.access_token);
			authWindow.close();
			api_is_good();
		}
	});
}

function forgetme() {
	delete g.access_token;
	$('#identity, #balance, #symbol', $('#p0')).empty();
	api_is_bad();
}

function ajax_log(ev, jqXHR, opts) {
	// also show some mini-progress icon?
	console.log('will ajax call ' + opts.url);
}

function ajax_done(data) {
	if (data.fault) {
		g.fault = data.fault;
		console.log('ajax done. error ' + g.fault.faultcode);
		var html = 'Error: ';
		if (g.fault.faultstring) {
			console.log('faultstring ' + g.fault.faultstring);
			html += g.fault.faultstring;
		}
		if (g.fault.details) {
			html += '<ul>';
			$.each(g.fault.details, function(d,detail){
				html += '<li>' + detail + '</li>';
			});
			html += '</ul>';
		}
		$('#error').html(html);
	} else {
		console.log('ajax done. ' + data);
		$('#error').empty();
	}
	if (data.markets) {
		if (g.test_api) g.test_api.resolve(data.markets)
	}
	if (data.offerings) {
		var div = '<div id="offerings" data-role="collapsibleset">';
		$.each(data.offerings, function(i,L1) {
			div +=  '<div data-role="collapsible">' + 
					'<h3>' + L1.market + '</h3>' +
					'<ul data-role="listview">';
			$.each(L1.available, function(j,L2) {
				div += '<li><a submarket="' + L2.submarket + '" href="#p3">' + L2.submarket + '</a></li>'
				g.submarkets[L2.submarket] = L2.available;
			});
			div += '</ul></div>'
		});
		div += '</div>';
		$('#p2 #output').html(div);

		$('ul[data-role="listview"]').listview();
		$('div[data-role="collapsibleset"]').collapsibleset();
		$('a[submarket]').click(go_submarket).attr("data-transition", "none");
	}
	if (data.symbol && data.symbol_type) {
		g.symbol_data = data;
		window.localStorage.setItem("symbol_data", g.symbol_data);
		draw_symbol(g.symbol_data);
	}
	if (data.account) {
		g.account_data = data.account;
		window.localStorage.setItem("account_data", g.account_data);
		draw_balance(g.account_data);
	}
	if (data.identity) {
		g.identity_data = data.identity;
		window.localStorage.setItem("identity_data", g.identity_data);
		draw_identity(g.identity_data);
	}
	if (data.contracts) {
		var cs = data.contracts;
		g.contracts = cs;
		var html = '';
		$.each(cs, function(i,c) {
			html += '<tr>' +
						'<td>' + date_str(c.purchase_time) + '</td>' +
						'<td>' + time_str(c.purchase_time) + '</td>' +
						'<td>' + c.payout_price + '</td>' +
						'<td>' + c.buy_price + '</td>' +
						'<td>' + c.underlying_symbol + '</td>' +
						'<td>' + c.contract_type + '</td>' +
						'<td>' + date_str(c.start_time) + '</td>' +
						'<td>' + time_str(c.start_time) + '</td>' +
						'<td>' + date_str(c.expiry_time) + '</td>' +
						'<td>' + time_str(c.expiry_time) + '</td>' +
						'<td>' + date_str(c.settlement_time) + '</td>' +
						'<td>' + time_str(c.settlement_time) + '</td>' +
						'<td>' + c.contract_id + '</td>' +
					'</tr>';
		});
		if (!html) html = 'no current contracts';
		$('#p6 #contracts tbody').html(html);
		$('#p6 #contracts table').table('refresh');
	}
	if (data.longcode) {
		var ask = data.ask;
		var longcode = data.longcode;
		console.log("quoted " + ask + ' for ' + longcode);
		$('#p5 #ask').html('Buy now for ' + ask);
		$('#p5 #longcode').html(longcode);
	}
	if (data.transaction_id) {
		var price = data.price;
		var longcode = data.longcode;
		var transaction_id = data.transaction_id;
		$('#p5 #ask').html('PURCHASED for ' + price);
		$('#p5 #longcode').html(longcode);
		$('#p5 #transaction-id').html('TrxID: ' + transaction_id);
	}
}

function draw_symbol(s) {
	s = s || window.localStorage.getItem('symbol_data');
	if (!s || !s.symbol) return;
	var html =  '<div>' + s.symbol + ' (' + s.display_name + ')</div>'
				+ '<div>Latest ' + s.quoted_currency_symbol + ' ' + s.spot + '</div>'
				+ '<div>Tradeable Now? ' + ((s.exchange_is_open&&!s.is_trading_suspended)?'Yes':'No (try "Randoms")') + '</div>';


	$('#p4 #output').html(html);
	$('#p0 #symbol').html(html);
	$('#p5 #symbol').html(s.symbol + ' (' + s.spot + ')');
}

function draw_balance(a) {
	a = a || window.localStorage.getItem('account_data');
	if (!a || !a.balance) return;
	var div = '<div>' + a.currency + ' ' + a.balance + '</div>';
	$('#p1 #account').html(div);
	$('#p0 #balance').text('Balance ' + a.currency + ' ' + a.balance);
}

function draw_identity(i) {
	i = i || window.localStorage.getItem('identity_data');
	if (!i || !i.loginid) return;
	var div = '<div>' + i.loginid + ' ' + i.first_name + ' ' + i.last_name + '</div>';
	$('#p1 #identity').html(div);
	$('#p0 #identity').text(i.loginid + ' ' + i.first_name + ' ' + i.last_name);
}

function ajax_fail(jqXHR, status, err) {
	console.log('got error: ' + jqXHR.status + ' ' + status + ' ' + err);
	if (g.test_api) g.test_api.reject();
}

function ajax_always() {
	$.mobile.loading("hide");
	delete g.test_api;
}

function home() {

	draw_symbol();
	draw_balance();
	draw_identity();
}

function markets() {
	$.mobile.loading("show");
	ajax_call.url  = proxy_site + '/markets';
	ajax_call.type = 'GET';
	$.ajax(ajax_call)
	 .done(ajax_done)
	 .fail(ajax_fail)
	 .always(ajax_always)
}

function symbols() {
	$.mobile.loading("show");
	ajax_call.url  = proxy_site + '/offerings?contract_category=Rise%2FFall&is_forward_starting=N&expiry_type=intraday';
	ajax_call.type = 'GET';
	$.ajax(ajax_call)
	 .done(ajax_done)
	 .fail(ajax_fail)
	 .always(ajax_always)
}

function symbol() {
	$.mobile.loading("show");
	if (!g.symbol) return;
	var sym = g.symbol.replace(/\//g, '-');
	ajax_call.url  = proxy_site + '/symbols/' + sym;
	ajax_call.type = 'GET';
	$.ajax(ajax_call)
	 .done(ajax_done)
	 .fail(ajax_fail)
	 .always(ajax_always)
}

function trade() {
	//$.mobile.loading("show");
}

function portfolio() {
	$.mobile.loading("show");
	ajax_call.url  = proxy_site + '/portfolio';
	ajax_call.type = 'GET';
	$.ajax(ajax_call)
	 .done(ajax_done)
	 .fail(ajax_fail)
	 .always(ajax_always)
}

function account() {
	$.mobile.loading("show");
	ajax_call.url  = proxy_site + '/account';
	ajax_call.type = 'GET';
	$.ajax(ajax_call)
	 .done(ajax_done)
	 .fail(ajax_fail)
	 .always(ajax_always)
}

function quote_or_buy(http_method) {
	if (!g.symbol) { alert('Pick a Market Symbol First!'); return }
	$.mobile.loading("show");
	var sym = g.symbol.replace(/\//g, '-');
	var contract_type = $('#p5 input[name="contract-type"]:checked').val();
	var duration = $('#p5 #duration').val() * 60;
	var payout = $('#p5 #payout').val();
	ajax_call.url  = proxy_site + '/contract/' + contract_type + '/' + sym + '/sec/' + duration + '/USD/' + payout + '/0/0/0';
	ajax_call.type = http_method;
	$.ajax(ajax_call)
	 .done(ajax_done)
	 .fail(ajax_fail)
	 .always(ajax_always)
}

function quote() { quote_or_buy('GET') }
function buy()   { quote_or_buy('POST') }

function go_submarket() {
	var $a = $(this);
	var submarket = $a.attr('submarket');
	var symbols = g.submarkets[submarket];
	var $symbol_list = $('#p3 #symbol-list');
	$('#p3 #submarket').text(submarket);
	$symbol_list.empty();
	$.each(symbols, function(i,L3) {
		var symbol = L3.symbol;
		$symbol_list.append('<li><a href="#">'+symbol+'</a></li>');
	});
	$symbol_list.listview().listview('refresh');
	$('li a', $symbol_list).click(go_symbol).attr("data-transition", "none");
}

function go_symbol(ev) {
	ev.preventDefault();
	var $a = $(this);
	g.symbol = $a.text();
	window.localStorage.setItem("symbol", g.symbol);
	$(':mobile-pagecontainer').pagecontainer('change', '#p4', {reload:true});
}

function api_is_good() {
	console.log("api is available")
	$('a', g.$bigButs_ctr).show();
	$('a#authorize', g.$bigButs_ctr).hide();
	account();
	symbol();
}

function api_is_bad() {
	$('a', g.$bigButs_ctr).hide();
	$('a#authorize', g.$bigButs_ctr).show();
	console.log("api NOT available")
}

function onDeviceReady() {

	// read saved data
	var keys = [ 'access_token', 'symbol' ];
	$.each(keys, function(k,key) { g[key] = window.localStorage.getItem(key) });
	ajax_call.headers = { Authorization: 'Bearer ' + g.access_token };

	// trace all ajax calls
	$(document).ajaxSend(ajax_log);

	// button handlers
	$('#authorize').click(authorize);
	$('#forget-me').click(forgetme);
	$('#quote').click(quote);
	$('#buy').click(buy);

	// setup pre-show pagehandlers
	var pageHandlers = {
		p0: home,
		p1: account,
		p2: symbols,
		p4: symbol,
		p5: trade,
		p6: portfolio
	};
	$(":mobile-pagecontainer").on('pagecontainerbeforeshow', function(ev,ui) {
		(pageHandlers[ui.toPage.attr('id')] || function(){})();
	});

	// fix flickery transitions? http://stackoverflow.com/questions/5953753/flickering-when-navigating-between-pages
	$("a").attr("data-transition", "none");

	// apply fastclick (avoid 300ms on-click delay)
	FastClick.attach(document.body);

	// add home-button to all headers
	$('div[data-role="header"]').attr("data-add-back-btn", 'true');

	// remove 'active' attr for these buttons only
	$(document).on('tap', function(e) {
		$('#p0 a.ui-btn').removeClass($.mobile.activeBtnClass);
		$('div[data-role="header"] a').removeClass($.mobile.activeBtnClass);
	});

	g.$bigButs_ctr = $('#p0 div[data-role="controlgroup"]');

	if (g.access_token) {
		// test api availability
		console.log("access_token is " + g.access_token);
		g.test_api = $.Deferred(markets)
					.done(api_is_good)
					.fail(api_is_bad)
					.always(function(){ navigator.splashscreen.hide() })
	} else {
		console.log("no access_token.");
		api_is_bad();
		navigator.splashscreen.hide();
	}

}

function onLoad() {
	document.addEventListener("deviceready", onDeviceReady, false);
}

