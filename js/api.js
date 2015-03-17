let apiRoot = 'https://rmg-prod.apigee.net/v1/binary';
let apiOptions = {
    mode: 'cors'
};

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

// Marketplace Discovery ///////////////////////////////////////////////////////

// Markets Discovery
export function getMarketsList() {
    return fetch(`${apiRoot}/markets/`, apiOtions);
}

// Symbols for Market
export function getMarket(market) {
    return fetch(`${apiRoot}/markets/${market}`, apiOtions);
}

// Exchanges Discovery
export function getExchangesList() {
    return fetch(`${apiRoot}/exchanges/`, apiOtions);
}

// Exchange Details
export function getExchange(exchange) {
    return fetch(`${apiRoot}/exchanges/${exchange}`, apiOtions);
}

// Symbols Discovery ///////////////////////////////////////////////////////////

// Symbols Discovery
export function getSymbolsList() {
    return fetch(`${apiRoot}/symbols/`, apiOtions);
}

// Symbol Detail
export function getSymbol(symbol) {
    return fetch(`${apiRoot}/symbols/${symbols}`, apiOtions);
}

// Symbol Price
export function getSymbolPrice(symbol) {
    return fetch(`${apiRoot}/symbols/${symbols}/price`, apiOtions);
}

// Price History ///////////////////////////////////////////////////////////////

// Historical Tick Data
export function getTickData(symbol) {
    return fetch(`${apiRoot}/symbols/${symbol}/ticks`, apiOtions);
}

// Historical Candlestick Data
export function getCandlestickData(symbol) {
    return fetch(`${apiRoot}/symbols/${symbol}/candles`, apiOtions);
}

// Contract Discovery //////////////////////////////////////////////////////////

// Available Contracts for Symbol
export function getContracts(symbol) {
    return fetch(`${apiRoot}/symbols/${symbol}/contracts`, apiOtions);
}

// Offerings Discovery
export function getOfferingsList() {
    return fetch(`${apiRoot}/offerings`, apiOtions);
}

// Contract Categories for Market
export function getContractCategories(market) {
    return fetch(`${apiRoot}/markets/${market}/contract_categories`, apiOtions);
}

// Contract Negotiation ////////////////////////////////////////////////////////

// Payout Currencies
export function getPayoutCurrencies() {
    return fetch(`${apiRoot}/payout_currencies`, apiOtions);
}

// Get Contract Price
export function getContractPrice(contractType, symbol, durationUnit, duration, payoutCurrency, payout, startTime, barrierLow, barrierHigh) {
    return fetch(`${apiRoot}/contract/${contractType}/${symbol}/${durationUnit}/${duration}/${payoutCurrency}/${payout}/${startTime}/${barrierLow}/${barrierHigh}`, apiOtions);
}

// Buy Contract
export function buyContract(contractType, symbol, durationUnit, duration, payoutCurrency, payout, startTime, barrierLow, barrierHigh) {
    apiOtions.method = 'post';
    return fetch(`${apiRoot}/contract/${contractType}/${symbol}/${durationUnit}/${duration}/${payoutCurrency}/${payout}/${startTime}/${barrierLow}/${barrierHigh}`, apiOtions);
}

// Portfolio ///////////////////////////////////////////////////////////////////

// Portfolio List
export function getPortfolioList() {
    return fetch(`${apiRoot}/portfolio`, apiOtions);
}

// Portfolio Detail
export function getPortfolio(contract) {
    return fetch(`${apiRoot}/portfolio/${contract}`, apiOtions);
}

// Sell Existing Contract
export function sellContract(contract, price) {
    return fetch(`${apiRoot}/portfolio/${contract}/sell/${price}`, apiOtions);
}

// Account Management //////////////////////////////////////////////////////////

// Account Detail
export function getAccount(contract) {
    return fetch(`${apiRoot}/account`, apiOtions);
}

// Account Update
export function updateAccount(account) {
    apiOtions.method = 'post';
    apiOtions.body = account;
    return fetch(`${apiRoot}/account`, apiOtions);
}

// Account Creation
export function createAccount(account) {
    apiOtions.method = 'post';
    apiOtions.body = account;
    return fetch(`${apiRoot}/new_account`, apiOtions);
}

// Account /////////////////////////////////////////////////////////////////////

// Statement
export function getStatement() {
    return fetch(`${apiRoot}/account/statement`, apiOtions);
}

// Countries
export function getCountries() {
    return fetch(`${apiRoot}/countries`, apiOtions);
}




export function symbol(symbolId) {
    return fetch(apiRoot + '/symbols/' + symbolId.replace(/\//g, '-'), apiOtions);
}
