---
title: 'Easy Debounce in TanStack Query with VueUse'
date: 2024-06-05
---

I would like to share really easy and efficient way how to debounce `useQuery` in Vue with a little help from VueUse utility library.

Just recently I had a task to add search feature to our app with the following requirements:
1. Text input with functionality to search for products.
2. As User types results should be presented "in-place", without page refresh or navigation.
3. If User keeps typing delay result update.
4. When User stopped typing for 1 second execute search request.
5. If User hit "Enter" key during 1 second delay period - execute search immediately.

This sounds like fairly common piece of functionality so let's see how we can implement this in Vue.js using TanStack Query. For this example I'll be using Vue Composition API with `<script setup>` component.
