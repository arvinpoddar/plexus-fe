<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <q-page class="login-card-container">
        <router-link to="/login" class="login-logo-link">
          <img src="~assets/full-theme.png" class="login-logo" />
        </router-link>
        <div class="pl-card login-card">
          <router-view />
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'LoginCardLayout'
})
</script>

<style lang="scss">
body {
  min-width: unset !important;
}

.login-card-container {
  display: flex;
  flex-direction: column;
  align-items: center;

  .login-logo-link {
    .login-logo {
      width: 100%;
      max-width: 370px;
      margin: 70px auto 30px auto;
    }
  }

  .login-card {
    --max-login-card-width: 93vw;
    --login-card-padding: 30px;

    --auth-form-width: 500px;
    --donate-form-width: 595px;

    padding: var(--login-card-padding);
    margin: 10px;
    margin-bottom: 40px;

    .card-header {
      font-size: 24px;
      font-weight: 600;
      text-align: center;
      margin-bottom: 32px;
    }

    .donate-form {
      width: calc(var(--max-login-card-width) - 2 * var(--login-card-padding));
      max-width: calc(var(--donate-form-width) - 2 * var(--login-card-padding));
    }

    .auth-form {
      width: calc(var(--max-login-card-width) - 2 * var(--login-card-padding));
      max-width: calc(var(--auth-form-width) - 2 * var(--login-card-padding));
    }
  }
}

@media only screen and (max-width: 768px) {
  .login-card-container {
    .login-logo-link {
      text-align: center;
      .login-logo {
        width: 75%;
        max-width: 370px;
        margin: 50px auto 20px auto;
      }
    }
  }
}
</style>
