const locationButton = document.querySelector('#locationButton');
const feelings = document.getElementById('feelings')
const d = new Date();
const button = document.getElementById('generate')

// HTML elements to update dynamically
let date = document.getElementById('date')
let temperature = document.getElementById('temp')
const content = document.getElementById('entryHolder')
let tem_desc = document.querySelector('.temperature-description');

let locationTime = document.querySelector('.location-timezone');
let temperatureSection = document.querySelector('.temperature-section');
let tempSpam = document.querySelector('.temperature-section span');
let zip = document.querySelector('#zip');
let long;
let lat;

const url = 'https://api.openweathermap.org/data/2.5/weather'
const appID = '23b3316eca2da1b32de057d130c47bbb'


updateWithLocation = () => {


    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(position => {
             long = position.coords.longitude;
             lat = position.coords.latitude;

            fetch( `${url}?lat=${lat}&lon=${long}&units=imperial&appid=${appID}`
            ).then(res =>{
                return res.json();
            }).then(data => {
                const {weather:[{description,icon}]} = data;
                const {main:{temp}} = data;

                temperature.textContent = temp;
                tem_desc.textContent = description;

                locationTime.textContent = `${d.toDateString()},${data.name},${data.sys.country}`;
                document.querySelector('#wicon').setAttribute('src', `http://openweathermap.org/img/wn/${icon}@2x.png` );


                let celsius = (temp - 32) * (5 / 9);


                temperatureSection.addEventListener('click',() => {
                    if(tempSpam.textContent === '°F'){
                        tempSpam.textContent = '°C';
                        temperature.textContent = Math.floor(celsius).toString();

                    }else {
                        tempSpam.textContent = '°F';
                        temperature.textContent = temp;
                    }

                });
            })

        }
    )}
}

locationButton.addEventListener('click', updateWithLocation());



const fetchWeather = async (baseURL, zip) => {
    try {
        const request = await fetch(
                `${baseURL}?zip=${zip},us&units=imperial&appid=${appID}`
        )
        const result = await request.json()
        // destructuring of the result object
        const {
            main: {temp}
        } = result;
        const {weather:[{description,icon}]} = result;
        const name = result.name;
        const {
            sys:{country}
        } = result;
        return {description,icon,name,country,temp};
    } catch (e) {
        throw e
    }
}
const saveData = async (path, data) => {
    try {
        await fetch(path, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
    } catch (e) {
        throw e
    }
}
const updateUI = async (temp, feelings,name,country,desc,icon) => {
    // date.innerHTML = d.toDateString();
    temperature.innerText = `${temp}`;
    content.innerText = `${feelings}`;
    locationTime.textContent = `${d.toDateString()},${name},${country}`;
    tem_desc.textContent =  `${desc}`
    document.querySelector('#wicon').setAttribute('src', `http://openweathermap.org/img/wn/${icon}@2x.png` );

    let celsius = (temp - 32) * (5 / 9);


    temperatureSection.addEventListener('click',() => {
        if(tempSpam.textContent === '°F'){
            tempSpam.textContent = '°C';
            temperature.textContent = Math.floor(celsius).toString();

        }else {
            tempSpam.textContent = '°F';
            temperature.textContent = temp;
        }

    });
}

button.addEventListener('click', () => {
    fetchWeather(url, zip.value)
        .then(result => {
          let  {description,name,country,icon,temp} = result;

            return {content: feelings.value,description,name,country,icon,temp};

        })
        .then(data => {
            saveData('/api/projectdata', data)

            return data;

        })
        .then((
            {temp,content,name,country,description,icon}



) => updateUI(temp,content,name,country,description,icon))
        .catch(e => {
            // There can be proper error handling with UI
            console.error(e)
        })
})