export default {
  getData (state, payload) {
    state.user.uid = payload.uid
    state.user.email = payload.email
  },

  switchLoginLoading (state) {
    state.loginLoading = true
  },

  switchLogin (state) {
    state.user.login = true
    state.loginErrorMessage = ''
    state.loginLoading = false
  },

  setLoginErrorMessage (state, errorCode) {
    if (errorCode === 'auth/invalid-email') {
      state.loginErrorMessage = '無効なメールアドレスです。'
    } else if(errorCode === 'auth/user-disabled') {
      state.loginErrorMessage = 'アカウントが無効になっています。\nお手数ですが管理者へお問い合わせください。'
    } else if(errorCode === 'auth/user-not-found') {
      state.loginErrorMessage = 'アカウントがありません。\n「アカウントをお持ちでない方はこちら」から新規登録をお願いします。'
    } else if(errorCode === 'auth/wrong-password') {
      state.loginErrorMessage = 'パスワードが正しくありません。'
    } else if (errorCode === 'auth/too-many-requests') {
      state.loginErrorMessage = 'ログインに何度も失敗しました。\n少し時間をおいてから、再度試してみてください。'
    }
    state.loginLoading = false
  },

  switchLogout (state) {
    state.user.login = false
  }
}