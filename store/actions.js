import { auth, storage, dbUsersRef, dbPicturesRef } from '@/plugins/firebase'
import firebase from 'firebase/compat/app'

export default {
  /**** ログイン ****/
  login ({ dispatch, commit }, payload) {
    commit('startLoading')

    /* ログイン処理 */
    auth
    .signInWithEmailAndPassword(payload.email, payload.password)
    .then(() => {
      auth.onAuthStateChanged((user) => {
        if (user) {
          commit('setUserData', { uid: user.uid, email: user.email })
          commit('switchLogin', true)
          commit('clearLoginFormError')

          this.$router.push('/clips/')
        }
      })
    })
    .catch((error) => {
      dispatch('showLoginError', error.code)
      console.log(`Login error: ${ error.message }`)
    })
  },

  googleLogin ({ commit }) {
    const provider = new firebase.auth.GoogleAuthProvider()
    auth
    .signInWithPopup(provider)
    .then(() => {
      auth.onAuthStateChanged((user) => {
        if (user) {
          commit('setUserData', { uid: user.uid, email: user.email })
          commit('switchLogin', true)

          this.$router.push('/clips/')
        }
      })
    })
    .catch((error) => {
      console.log(`Login error: ${ error.message }`)
    })
  },

  showLoginError ({ commit }, errorCode) {
    commit('setLoginErrorMessage', errorCode)
  },

  /**** ユーザー登録 ****/
  register ({ dispatch, commit }, payload) {
    commit('startLoading')

    /* ユーザー登録処理 */
    auth.createUserWithEmailAndPassword(payload.email, payload.password)
    .then(() => {
      const user = auth.currentUser
      if (user) {
        commit('setUserData', { uid: user.uid, email: user.email })
        commit('switchLogin', true)
        commit('clearRegisterFormError')

        // users コレクションに登録
        dbUsersRef
        .doc(user.uid)
        .set({
          created_time: new Date(),
          email: user.email,
          name: payload.name,
          image: '',
          introduction: '',
          releases: 0
        })
        .then(() => {
          console.log('User registration succeeded!')
        })
        .catch((error) => {
          console.error(error)
        })
      }
      this.$router.push('/clips/')
    })
    .catch((error) => {
      dispatch('showRegisterError', error.code)
      console.log(`Register error: ${ error.message }`)
    })
  },

  showRegisterError ({ commit }, errorCode) {
    commit('setRegisterErrorMessage', errorCode)
  },

  /**** ログアウト ****/
  logout ({ commit }) {
    auth
    .signOut()
    .then(() => {
      this.$router.push('/')
      commit('switchLogin', false)
      commit('clearLoginFormError')
      commit('switchLogoutMessage', true)

      setTimeout(() => {
        commit('switchLogoutMessage', false)
      }, 3000)
    })
    .catch((error) => {
      console.log(`Logout error: ${ error.message }`)
    })
  },

  /**** ログイン認証状態のチェック ****/
  checkAuth ({ dispatch, commit }) {
    auth.onAuthStateChanged((user) => {
      user = user ? user : {}
      if (user) {
        // ログイン状態を更新
        const isAuthenticated = user.uid ? true : false
        commit('switchLogin', isAuthenticated)

        dispatch('fetchUserData')
      } else {
        return
      }
    })
  },

  /**** FireStoreからユーザー情報を取得・取得したデータでStoreのuserを更新 ****/
  fetchUserData ({ commit }) {
    const user = auth.currentUser

    if (user) {
      const uid = user.uid

      // FireStoreからユーザー情報を取得
      dbUsersRef
      .doc(uid)
      .get()
      .then((doc) => {
        if (doc.exists) {
          const data = doc.data()

          // Storeのuserを更新
          commit('setUserData', { uid: user.uid, email: user.email, name: data.name, image: data.image, introduction: data.introduction, releases: data.releases })
        } else {
          return
        }
      }).catch((error) => {
        console.log(error)
      })
    } else {
      return
    }
  }
}
