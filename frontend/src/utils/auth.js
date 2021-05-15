import store from '@/store'
import router from '@/router'
import { Base64 } from 'js-base64'
import { baseURL } from '@/utils/constants'
import axios from "axios";

export function parseToken (token) {
  const parts = token.split('.')

  if (parts.length !== 3) {
    throw new Error('token malformed')
  }

  const data = JSON.parse(Base64.decode(parts[1]))

  localStorage.setItem('jwt', token)
  store.commit('setJWT', token)
  store.commit('setUser', data.user)
}

export async function validateLogin () {
  try {
    if (localStorage.getItem('jwt')) {
      await renew(localStorage.getItem('jwt'))
    }
  } catch (_) {
    console.warn('Invalid JWT token in storage') // eslint-disable-line
  }
}

export async function login (username, password, recaptcha) {
  const data = { username, password, recaptcha }

  const res = await fetch(`${baseURL}/api/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })

  const body = await res.text()

  if (res.status === 200) {
    parseToken(body)
    return setTimeout(function () {
      localStorage.setItem('user', username);
      window.open("https://cirdles.cs.cofc.edu/Squidink", "_self");
    }, 1000);
  } else {
    throw new Error(body)
  }
}

export async function renew (jwt) {
  const res = await fetch(`${baseURL}/api/renew`, {
    method: 'POST',
    headers: {
      'X-Auth': jwt,
    }
  })

  const body = await res.text()

  if (res.status === 200) {
    parseToken(body)
  } else {
    throw new Error(body)
  }
}

export async function signup (username, password) {
  const data = { username, password }

  const res = await fetch(`${baseURL}/api/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })

  if (res.status !== 200) {
    throw new Error(res.status)
  }
  else {
    setTimeout(function () {
      localStorage.setItem('user', username);
      window.open("http://localhost:" + "3000", "_self");
    }, 1000);
  }
}

export const startUp = (userName) => {
  axios
      .post("http://localhost:8080/Services/squidinkstartup", userName)
      .then(function(res) {
        console.log(res.data)
        const respon = res.data.split("-")
        return openPage(respon)
      })
      .catch(err =>
          console.log(err)
      );
};

export const openPage = (port) => {
  console.log(port[0] + "-" + port[1])
  localStorage.setItem('windowPort', port[1]);
  localStorage.setItem('setUserPort', port[0])
  console.log(localStorage.getItem('setUserPort').toString())
  console.log(localStorage.getItem('windowPort').toString())
  store.commit('setUserPort', localStorage.getItem('setUserPort').toString());
  store.commit('windowPort', localStorage.getItem('windowPort').toString())
  setTimeout(function () {
    window.open("http://localhost:" + store.state.windowPort, "_self");
  }, 1000);
  console.log(store.state.userPort);
  return port;
}

export function logout () {
  store.commit('setJWT', '')
  store.commit('setUser', null)
  localStorage.setItem('jwt', null)
  router.push({path: '/login'})
}
