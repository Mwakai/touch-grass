<script setup>
import router from '@/router'
import { useAuthStore } from '@/stores/auth'
const authStore = useAuthStore()

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div>
    <h1>Dashboard</h1>
    <p>Welcome to your dashboard!</p>
  </div>

  <div class="logout">
    <!-- Logout button -->
    <button @click="handleLogout">Logout</button>
  </div>
</template>
