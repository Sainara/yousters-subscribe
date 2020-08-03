<template>
  <main>
    <h1>Yousters Subscribe</h1>
    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
        <g fill="#E01F19" fill-rule="evenodd">
            <circle cx="32" cy="32" r="32" opacity=".12"></circle>
            <path fill-rule="nonzero" d="M36.2 32l7.275 8.55c.825.825.6 2.1-.225 2.925-.825.6-1.875.6-2.7 0L32 36.2l-8.55 7.275c-.825.825-2.1.6-2.925-.225a2.25 2.25 0 0 1 0-2.7L27.8 32l-7.275-8.55c-.825-.825-.6-2.1.225-2.925a2.25 2.25 0 0 1 2.7 0L32 27.8l8.55-7.275c.825-.825 2.1-.6 2.925.225.6.825.6 1.875 0 2.7L36.2 32z"></path>
        </g>
    </svg>
    <p id="errorText">Ошибка! {{ message }}</p>
    <a id="errorLink" href="/">На главную</a>
  </main>
</template>

<script>
export default {
  // data: function() {
  //   return {
  //     message: "Hello"
  //   };
  // },
  props: ['message'],
};
</script>
