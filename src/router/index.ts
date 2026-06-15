import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/pages/HomePage.vue'
import CategoryPage from '@/pages/CategoryPage.vue'
import SearchPage from '@/pages/SearchPage.vue'
import DetailPage from '@/pages/DetailPage.vue'
import PlayPage from '@/pages/PlayPage.vue'
import UserAgreementPage from '@/pages/UserAgreementPage.vue'
import PrivacyPolicyPage from '@/pages/PrivacyPolicyPage.vue'
import AdminLoginPage from '@/pages/AdminLoginPage.vue'
import AdminPage from '@/pages/AdminPage.vue'
import AdminDramaPage from '@/pages/AdminDramaPage.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomePage,
  },
  {
    path: '/category',
    name: 'category',
    component: CategoryPage,
  },
  {
    path: '/search',
    name: 'search',
    component: SearchPage,
  },
  {
    path: '/detail/:id',
    name: 'detail',
    component: DetailPage,
  },
  {
    path: '/play/:id/:ep',
    name: 'play',
    component: PlayPage,
  },
  {
    path: '/user-agreement',
    name: 'user-agreement',
    component: UserAgreementPage,
  },
  {
    path: '/privacy-policy',
    name: 'privacy-policy',
    component: PrivacyPolicyPage,
  },
  {
    path: '/admin/login',
    name: 'admin-login',
    component: AdminLoginPage,
  },
  {
    path: '/admin',
    name: 'admin',
    component: AdminPage,
  },
  {
    path: '/admin/drama/:id',
    name: 'admin-drama',
    component: AdminDramaPage,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
