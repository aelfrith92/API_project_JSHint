// Defining API key
const API_KEY = 'insert API key here';
// Defining the API default URL
const API_URL = "https://ci-jshint.herokuapp.com/api";
// Bootstrap 5, which we’ve used to format this project, allows us to trigger modals
// using JavaScript, and they conveniently supply the methods for this.
// Since our script.js file is loading  after Bootstrap’s JavaScript file,  
// we can make use of Bootstrap’s functions. So, we'll create a reference to our modal. 
// We'll make it another constant,  we'll call it resultsModal. That's going to be a 
// new Bootstrap modal and its going to be the modal with the ID of resultsModal.
const resultsModal = new bootstrap.Modal(document.getElementById('resultsModal'));

// Now need to wire up the button, and then we'll need two more functions.
// One to fetch the data and the other to display it.
// So let’s wire up our button first.
// This is going to be a standard event listener, which you’ve encountered before.
// So we're going to get the element with the ID of status which is our button.
// We're going to add a click event listen to it. 
// And then we're going to call  the git status function.
// Now we're passing in 'e' there which is a reference to the event.
// We won’t actually use it  in these lessons, but it’s 
// good practice to pass the event  object into our handler function.
document.getElementById("status").addEventListener("click", e => getStatus(e));

// When we’re handling promises, we have two ways of doing it.
// We can chain “.then”s as we did before, 
// or we can wrap the promises in  an async function - like this -
// and then await the promise coming true.
// And that’s exactly what we’re going to do here.
async function getStatus(e){
	// So now, let’s build our query string.
	// The query string will consist of the URL and 
	// the parameters that we need  to send over to the API.
	// Let’s just pop back over to the API instructions 
	// and see what parameter we need  to send with a GET request.
	// Una volta individuata la logica dietro la composizione dell'URL...
	const queryString = `${API_URL}?api_key=${API_KEY}`;
	// Now that we’ve done that, let’s “await” our response.
	const response = await fetch(queryString);
	// When the response comes back, we'll need to convert it to json.
	// Remember that the json() method also returns 
	// a promise, so we need to await that too.
	const data = await response.json();
	// So, at this stage in our function, we can assume that we'll have some data back.
	// It will either be our key expiry data, or it will be an error.
	// Now an error could arise for all sorts of reasons - the API key could have expired, we could
	// have typed in the URL wrongly,  
	// or it could actually be a fault at the API’s end.
	// If everything has gone well, a property is set on the response object.
	// And this property is the “ok” property.
	
	// If the server returns the HTTP status code of 200 then, then you’ll remember, our request
	// has been successful and the “ok” property will be set to True.
	// If it returns an error code, then the “ok” property will be set to false.
	// For now, let’s add an if to check if our response.ok property is set to True.
	// And if it is, we'll console.log out our response.
	if (response.ok) {
		// Instead of just logging out the status, we can display it in the modal
		// How? Call the function and pass data as parameter:
		displayStatus(data);
	} else {
		// if  an error is returned, then we have a descriptive  
		// message in the “error” field, as well as a status code. 
		// And this means that in our code we can add  an else clause to our if statement and throw  
		// an error if the response is not "okay". So let's do that now.   
		// And here we're using the built-in JavaScript error handler to throw a new error but you can see here where it says  
		// 'data.error' that that's the descriptive  message from the json that's been returned.
		throw new Error(data.error);
	}
}

function displayStatus(data){

	modalHeader = document.getElementById('resultsModalTitle');
	modalBody = document.getElementById('results-content');
	modalHeader.innerText = `API Key Status: ${data.status_code}`;
	modalBody.innerHTML = `
	<div>Your key is valid until</div>
	<div>${data.expiry}</div>
	`;
	// Il seguente metodo riprende la costante definita sopra e vi associa il metodo
	// .show() dalle risorse integrate con bootstrap. Ovviamente, viene richiamato
	// quando il contenuto dell'area resultsModal è stato ridefinito con il testo della
	// chiamata API sopra.
	resultsModal.show();
}

// we'll make a POST request to the API.  
// Essentially, it consists of the same two functions. 
// Firstly, a function to make the request. And secondly, a function to display the data.
document.getElementById("submit").addEventListener("click", e => postForm(e));

function displayErrors(data) {
	// we want to set our heading. So just as we did  
	// before I'm going to create a template literal this  time and give the heading of 'JShint Results for'  
	// and then we're going to pick up the file value from our return to json.
	let heading = `JSHint Results for ${data.file}`;

	// Now we can have an if statement if the total  number of errors that have been returned is  
	// equal to zero. Then, we're just going to set  our results variable here to a div. 
	if (data.total_errors === 0) {
		results = `<div class="no_errors">No errors reported!<div>`;
	} else {
		results = `<div>Total errors: <span class='error_count'>${data.total_errors}</span><div>`;
		for (let error of data.error_list){
			results += `<div> At line <span class='line'>${error.line}</span>, `;
			results += `column <span class='column'>${error.col}</span></div>`;
			results += `<div class='error'>${error.error}</div>`;
			modalHeader = document.getElementById('resultsModalTitle');
		}
		modalBody = document.getElementById('results-content');
		modalHeader.innerText = heading;
		modalBody.innerHTML = results;
		resultsModal.show();
	}
}

function processedOptions(form){
	// Questa funzione restituisce un array di valori separati da virgola di tipo stringa
	// per poter venire incontro alle necessità delle istruzioni API POST options, ovvero:	
	// options - a comma separated list of options, which are outlined below. These options are optional...as the name suggests

	// How to solve this problem? Split it into smaller steps and we need to:
	// 1. Iterate through the options;
	// 2. Push each value into a temporary array;
	// 3. Convert the array back to a string.
	let optArray = [];
	for (let entry of form.entries()){
		// il metodo .entries() crea un iteratore di array, che assegna al primo valore 
		// la chiave (o name in HTML) e al secondo il valore (o contenuto HTML). Quindi,
		// per passare i dati correttamente alla nostra API, bisognerebbe prendere tutti 
		// i form options separati e unirli sotto un'unica chiave cui corrisponde un array di 
		// valori separati da virgola. Il seguente controllo si interpreta: 
		// se il primo valore di ogni array entry è options, inseriscine il valore nell'array vuoto
		// creato sopra; 
		if (entry[0] === 'options'){
			optArray.push(entry[1]);
		}
	}
	// delete all of the existing options, to add the new ones
	// form.delete(), then supplying options as the key name will
	// delete all occurrences of options in our form data
	form.delete('options');

	// all we need to do is append our new options: we'll
	// append the key called options and the value here will be our opt array
	// and we'll use the join method to convert it back to a string
	// which by default is separated by commas if we don't specify
	// a delimiter in join so what this will do is
	// append back a comma separated string of options
	// to our form then all we need to do is just return the form
	// append nel caso di oggetti accetta il primo valore come chiave, il secondo come valore.
	form.append('options', optArray.join());

	return form;
}

async function postForm(e){
	// make a new constant, we'll call it 'Form'.  And this is going to be a new formData object  
	// and the reference is going to be a element with the ID of "checksform".
	// Per ulteriori: https://developer.mozilla.org/en-US/docs/Web/API/FormData
	// La seguente costante non è altro che un oggetto creato dal contenuto stesso inserito
	// dall'utente. Per creare un oggetto, ci serviamo del COSTRUTTORE FormData(), che accetta
	// come argomento il target DOM del form
	const form = processedOptions(new FormData(document.getElementById('checksform')));
	
	// the formData object has several default  methods that allow us to manipulate the data. 
	// One of these, is the entries method. Which  we can iterate through to see the form entries.
	// So let's add a little bit  of code to our postForm function.  
	// And we're going to say for 'let e of form' and then call the entries method.  
	// And so this will iterate through each  of the form entries putting it in 'e',
	// and then we'll just console log out that element of form entries, we'll console logout 'e'.  
	// the following iteration is for testing purposes, the variable is local scoped, not related to 
	// the one passing info about the event. It tracks the values of our form object returned by .entries()
	// for (let e of form.entries()){
	// 	console.log(e);
	// }

	// look at the api instructions again. For options it says
	// that options should be a comma separated list of options
	// il metodo .entries() restituisce un iterator di coppie key/value
	
	// for (let entry of form.entries()){
		// console.log(entry);
		// well as we can see every time we click on an option it creates another key
		// with the value of option so this is not sending as a comma separated
		// list in other words; our api will be very confused because it's not receiving the
		// options in the format that it expects
	// }
	// I need to 'await fetch' because it returns a promise. So I need to add in a weight  
	// and I'm just going to tidy things up  by removing the hard-coded reference  
	// to our API URL here. And instead,  I'll put in our API URL constant.
	// We'll tidy that up a little bit. And you can see  that the second argument here then, is the method  
	// and the headers. await is necessary as we need to 'WAIT' for the promise.
	
	// POST your data to the endpoint. The API currently lives at https://ci-jshint.herokuapp.com/api
	// This API accepts the following parameters:
	// code - the JavaScript code you want to check...or
	// url - the URL to a JavaScript file that you want to check
	// filename - a text field containing the name of the file you are checking. Optional if you're passing in a URL
	// options - a comma separated list of options, which are outlined below. These options are optional...as the name suggests
	
	// The API key must be passed in the headers. Here is an example of setting the header for JavaScript:
	// const response = fetch("https://ci-jshint.herokuapp.com/api", {
	// 												method: "POST",
	// 												headers: {
	// 																		"Authorization": API_KEY,
	// 																 }
	// 												})
	const response = await fetch(API_URL, {
		method: 'POST',
		headers: {
			'Authorization': API_KEY,
		},
		// formData object, all we need to do is add it  into the request just after the headers, like so.  
		// Using 'body: form'. So this will make a 1. POST request to the API, 2. authorize it with the API key,  
		// and 3. attach the form (constant created above) as the body of the request. 
		body: form,
	});

	// response è il corpo restituito dalla chiamata API, data è il corpo response convertito in sintassi json()
	const data = await response.json();
	// viene ripetuto il controllo della proprietà ok per capire se sia andato tutto bene con la richiesta
	if (response.ok) {
		displayErrors(data);
	} else {
		let heading = `An exception occurred...`;
		let modalHeader = document.getElementById('resultsModalTitle');
		let modalBody = document.getElementById('results-content');
		let results = `<div>The API returned status code ${data.status_code}<div>`;
		results += `<div>Error number: ${data.error_no}<div>`;
		results += `<div>Error text: ${data.error}<div>`;
		
		modalHeader.innerText = heading;
		modalBody.innerHTML = results;
		resultsModal.show();
		throw new Error(data.error);
	}
}