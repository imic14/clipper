import { auth, storage, dbUsersRef, dbPicturesRef } from '@/plugins/firebase'

export default {
  /**** ログイン ****/
  login ({ dispatch, commit }, payload) {
    commit('startLoading')

    /* ログイン処理 */
    auth.signInWithEmailAndPassword(payload.email, payload.password)
    .then(() => {
      auth.onAuthStateChanged((user) => {
        if (user) {
          commit('getUserData', { uid: user.uid, email: user.email })
          commit('switchLogin', true)
          commit('clearLoginFormError')
        }
      })
      this.$router.push('/clips/')
    })
    .catch((error) => {
      dispatch('showLoginError', error.code)
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
      auth.onAuthStateChanged((user) => {
        if (user) {
          commit('getUserData', { uid: user.uid, email: user.email })
          commit('switchLogin', true)
          commit('clearRegisterFormError')

          // users コレクションに登録
          dbUsersRef
          .doc(user.uid)
          .set({
            created_time: new Date(),
            email: user.email,
            name: payload.name,
            profile: '',
            releases: 0
          })
          .then(() => {
            console.log('User registration succeeded!')
          })
          .catch((error) => {
            console.error(error)
          })
        }
      })
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
    auth.signOut()
    .then(() => {
      setTimeout(() => {
        this.$router.push('/')
        commit('switchLogin', false)
      }, 1000)
    })
    .catch((error) => {
      console.log(`Logout error: ${ error.message }`)
    })
  },

  /**** ログイン認証状態のチェック ****/
  checkAuth ({ dispatch, commit }) {
    // ユーザー情報を更新
    dispatch('updateUserStore')

    // ログイン状態を更新
    auth.onAuthStateChanged((user) => {
      user = user ? user : {}
      if (user) {
        const isAuthenticated = user.uid ? true : false
        commit('switchLogin', isAuthenticated)
      }
    })
  },

  /**** ストアのユーザー情報を更新 ****/
  updateUserStore ({ commit }) {
    auth.onAuthStateChanged((user) => {
      user = user ? user : {}
      if (user) {
        dbUsersRef
        .doc(user.uid)
        .get()
        .then((doc) => {
          if (doc.exists) {
            const data = doc.data()
            commit('getUserData', { uid: user.uid, email: user.email, name: data.name, image: data.image, introduction: data.introduction, releases: data.releases })
          } else {
            return
          }
        }).catch((error) => {
          console.log(error)
        })
      }
    })
  }
}
