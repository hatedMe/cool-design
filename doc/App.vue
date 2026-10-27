<script setup lang="ts">
import { computed, defineAsyncComponent, nextTick, onBeforeUnmount, ref, watchEffect } from 'vue';
import { ConfigProvider, version } from '../package/index';
import { pages } from './site/catalog';
import { renderMarkdown } from './site/markdown';
import { highlightCode } from './site/highlight';
import DemoBlock from './site/DemoBlock.vue';
import HomePage from './site/HomePage.vue';
import './site/style.scss';

const UserManagement = defineAsyncComponent(() => import('../examples/user-management/index.vue'));

const readRoute = () => window.location.hash.slice(2) || 'home';
const route = ref(readRoute());
const query = ref('');
const dark = ref(false);
const navigationOpen = ref(false);
const article = ref<HTMLElement>();
const page = computed(() => pages.find((item) => item.id === route.value));
const registration = computed(() => {
  const names = page.value?.imports ?? [];
  const code = [
    ...(names.length ? [`import { ${names.join(', ')} } from 'cool-design';`] : []),
    "import 'cool-design/style.css';"
  ].join('\n');
  return highlightCode(code, 'ts');
});
watchEffect(() => {
  document.title =
    route.value === 'home'
      ? 'Cool Design · 为桌面应用提供清晰、一致的交互。'
      : `${route.value === 'examples/user-management' ? '用户管理示例' : page.value?.title || '页面未找到'} · Cool Design`;
});
const groups = computed(() => {
  const matching = pages.filter((item) => item.title.toLowerCase().includes(query.value.trim().toLowerCase()));
  return [...new Set(matching.map((item) => item.group))].map((title) => ({
    title,
    pages: matching.filter((item) => item.group === title)
  }));
});
const intro = computed(() => renderMarkdown((page.value?.markdown || '').split(/^## API\s*$/m)[0]));
const api = computed(() => {
  const content = page.value?.markdown.split(/^## API\s*$/m)[1];
  return content ? renderMarkdown(content) : '';
});
async function navigate() {
  const next = readRoute();
  if (next === route.value) return;
  route.value = next;
  navigationOpen.value = false;
  await nextTick();
  article.value?.focus({ preventScroll: true });
  window.scrollTo({ top: 0 });
}
function jump(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
window.addEventListener('hashchange', navigate);
onBeforeUnmount(() => window.removeEventListener('hashchange', navigate));
</script>

<template>
  <ConfigProvider :theme="dark ? 'dark' : 'light'" class="docs-app">
    <template v-if="route === 'examples/user-management'">
      <div class="docs-example-bar">
        <a href="#/components/table">返回组件文档</a>
      </div>
      <UserManagement />
    </template>
    <template v-else>
      <a class="docs-skip" href="#docs-content" @click.prevent="article?.focus()">跳到正文</a>
      <header class="docs-header">
        <a class="docs-brand" href="#/home" aria-label="Cool Design 首页">
          <span class="docs-brand-mark">C</span>
          Cool Design
        </a>
        <span class="docs-header-label">
          PC 组件文档
          <span class="docs-version">{{ version }}</span>
        </span>
        <nav aria-label="站点导航">
          <a href="#/home" :aria-current="route === 'home' ? 'page' : undefined">首页</a>
          <a href="#/guide/quickstart">开发指南</a>
          <a href="#/components/button">组件</a>
          <a href="#/examples/user-management">业务示例</a>
          <button type="button" @click="dark = !dark">
            {{ dark ? '浅色模式' : '深色模式' }}
          </button>
        </nav>
      </header>
      <button
        v-if="route !== 'home'"
        class="docs-menu"
        type="button"
        :aria-expanded="navigationOpen"
        aria-controls="docs-navigation"
        @click="navigationOpen = !navigationOpen">
        组件目录
      </button>
      <aside v-if="route !== 'home'" id="docs-navigation" class="docs-sidebar" :class="{ 'is-open': navigationOpen }">
        <label class="docs-search">
          <span>搜索组件</span>
          <input v-model="query" type="search" placeholder="输入组件名称…" />
        </label>
        <nav aria-label="文档导航">
          <section v-for="group in groups" :key="group.title" class="docs-nav-group">
            <h2>{{ group.title }}</h2>
            <a
              v-for="item in group.pages"
              :key="item.id"
              :href="`#/${item.id}`"
              :aria-current="route === item.id ? 'page' : undefined">
              {{ item.title }}
            </a>
          </section>
          <p v-if="!groups.length" class="docs-search-empty">未找到组件，请尝试其他名称。</p>
        </nav>
      </aside>
      <div class="docs-body" :class="{ 'docs-body--home': route === 'home' }">
        <main id="docs-content" ref="article" class="docs-content" tabindex="-1">
          <HomePage v-if="route === 'home'" />
          <template v-else-if="page">
            <div class="docs-breadcrumb">
              {{ page.group }}
              <span>/</span>
              {{ page.title }}
            </div>
            <article :key="page.id">
              <div class="docs-markdown" v-html="intro" />
              <template v-if="page.demos.length">
                <section v-if="page.group !== '开发指南'" id="registration" class="docs-registration">
                  <h2>{{ page.imports?.length ? '引入组件' : '引入样式' }}</h2>
                  <pre><code
class="hljs language-ts"
                                               v-html="registration"
                  /></pre>
                  <p>
                    示例使用局部引入，可直接复制完整 Vue 文件。安装和全局注册方式见
                    <a href="#/guide/quickstart">快速上手</a>
                    。
                  </p>
                </section>
                <h2 id="examples">代码演示</h2>
                <DemoBlock v-for="demo in page.demos" :id="`demo-${demo.name}`" :key="demo.name" :demo="demo" />
              </template>
              <section v-if="api" id="api" class="docs-markdown">
                <h2>API</h2>
                <div v-html="api" />
              </section>
            </article>
            <footer class="docs-footer">Cool Design · 为桌面应用提供清晰、一致的交互。</footer>
          </template>
          <template v-else>
            <h1>页面未找到</h1>
            <p>
              此文档地址不存在，
              <a href="#/guide/quickstart">返回快速上手</a>
              。
            </p>
          </template>
        </main>
        <aside v-if="page?.demos.length" class="docs-toc" aria-label="本页目录">
          <p>本页内容</p>
          <button v-if="page.group !== '开发指南'" type="button" @click="jump('registration')">引入组件</button>
          <button type="button" @click="jump('examples')">代码演示</button>
          <button
            v-for="demo in page.demos"
            :key="demo.name"
            type="button"
            class="docs-toc-demo"
            @click="jump(`demo-${demo.name}`)">
            {{ demo.title }}
          </button>
          <button v-if="api" type="button" @click="jump('api')">API</button>
        </aside>
      </div>
    </template>
  </ConfigProvider>
</template>
