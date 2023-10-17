'use strict';

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputTemp = document.querySelector('.form__input--temp');
const inputClimb = document.querySelector('.form__input--climb');

let map, mapEvent;

class App {
    constructor() {

    }

    _getPosition() {}

    _loadMap(position) {
        const {latitude, longitude} = position.coords;

        const coords = [latitude, longitude]
    
        map = L.map('map').setView(coords, 13);
    
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
    
        map.on('click', (event) => {
    
            mapEvent = event;
    
            form.classList.remove('hidden');
            inputDistance.focus();
        });
    }

    _showForm() {}

    _toggleClimbField() {}

    _newWorkout() {}
};

function navigatorSucces(position) {

};

function navigatorFailure() {
    alert('Невозможно получить ваше мостоположение');
};

if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(navigatorSucces, navigatorFailure);
};

form.addEventListener('submit', (e) => {
    e.preventDefault();

    inputDuration.value = inputDistance.value = inputTemp.value = inputClimb.value = '';

    const {lat, lng} = mapEvent.latlng;

    L.marker([lat, lng])
    .addTo(map)
    .bindPopup(
        L.popup({
            autoClose: false,
            closeOnClick: false,
            className: 'running-popup',
        })
        )
    .setPopupContent('Тренировка')
    .openPopup();
});

inputType.addEventListener('change', () => {
    inputClimb.closest('.form__row').classList.toggle('form__row--hidden');
    inputTemp.closest('.form__row').classList.toggle('form__row--hidden');
});

