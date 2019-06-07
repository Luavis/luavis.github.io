---
layout: post
title: "React, Typescript, Webpack환경에서 번들링 속도 올리기"
date: 2019-06-07 18:44:00 +09:00
categories: web
description: "Webpack과 Typescript를 쓰는 환경에서 번들 속도 올리기"
keywords: "Typescript, 타입스크립트, Javascript, 자바스크립트, webpack, React, bundle, speed up, 속도 올리기, 빠르게, 번들링, 번들"

---

제니퍼소프트에서 진행하는 프로젝트에서 Webpack과 TypeScript, React를 사용하고 있다. SPA는 필수적인 선택지였다. classic한 개발 방식으로는 web page는 몰라도 web application을 개발하기엔 부적합하다. 그 중에서도 React를 선택한 이유는 훌륭한 레퍼런스들과 안정적인 소스 관리, 무엇보다 가장 잘 쓸줄 아는 것을 선택했다.

Webpack은 그 외의 선택의 여지가 약하기 때문에 webpack을 선택했지만, 이 프로젝트를 시작하면서 실전에서는 처음으로 TypeScript를 선택해서 사용했다. TS를 사용한 효과를 간략히 설명하면, TS를 사용함으로써 버그가 줄었는가는 모르겠지만 TS를 사용함에 따라 자동완성과 Go to definition에서 오는 생산성 향상은 확실히 체감할 수 있었다.

처음에는 webpack의 빌드의 속도는 큰 문제가 없었지만, 소스코드가 늘어남에 따라 hot reload가 더 이상 hot하지 않게되었다. 하지만 설정을 통해 webpack으로 빌드시에 **20초** 정도 걸렸던것을 초기 빌드 속도는 **7초** 캐시 사용시에는 **4초** 정도로 떨어졌다.

## loader 줄이기.

당연하지만 load는 줄일 수 있을만큼 줄이면 좋다. 개발 당시에는 `babel-loader`와 `ts-loader`를 둘 다 사용했지만, Typescript의 기능만으로도 JSX 컴파일과 구 ES을 타겟으로 하는 컴파일이 가능하고 최신 ES의 기능을 그렇게 많이 사용하는 편도 아닌지라 `babel-loader`를 걷어내고 `ts-loader`만을 사용하기로 했다.

Typescript를 컴파일 시키는 방법으로는 지금에는 3가지 정도의 방법이 있는듯 싶다. `awesome-typescript-loader`를 쓰는 방법과 `ts-loader`를 쓰는 방법, `babel-loader`에 `typescript-preset`을 얹는 방법이 있다. 다만 `awesome-typescript-loader`는 사용하는것을 지양하는 편이 좋다고 이야기들 한다.

1. [awesome-typescript-loaderはもう使わないようにしよう、その理由](https://qiita.com/__sakito__/items/56510d2ab15f87311b36)
1. [awesome-typescript-loader vs ts-loader](https://www.npmtrends.com/awesome-typescript-loader-vs-ts-loader)

물론 반박하는 이를 반박하는 글 또한 있지만 많이들 사용하는 쪽으로 선택하기로 했다. 또한 babel-loader를 통하는 방법은 아직 다양한 옵션이 부족한듯 싶고 transpile과 type check가 분리되는지에 대해 확신이 서지 않기 때문에, 보류하기로 했다.

## transpileOnly, experimentalWatchApi

`ts-loader`는 기본 옵션이 TS를 JS로 변환하는 transpile 작업과 type check 작업을 같은 스레드에서 동시에 실행한다. type check는 개발자에게 편의 제공을 위한 기능이지 type이 브라우저에게 넘어갈 결과물에 까지는 영향을 주지 않기 때문에, type check 작업은 분리되어도 상관없다. 따라서 ts-loader에는 transpile 작업만을 진행하는 옵션이 있다. 이를 설정하고 `ts-loader`는 transpile 작업을 진행하고, type check는 `fork-ts-checker-webpack-plugin` 플러그인을 통해서 체크하도록 했다.

파일이 변경되면 변경된 파일만 컴파일해서 합치면 변경시의 컴파일 속도를 올릴 많이 올릴 수 있다. 기존에는 TS가 사용하는 watch API가 공개되어 있지 않아서 따로 구축했다. experimentalWatchApi 옵션을 사용하면 `ts-loader`가 TypeScript의 내부 watch mode API를 사용하여 재컴파일해야하는 파일 수를 크게 줄일 수 있다.

```js
{
    test: /\.tsx?$/,
    loader: [
        {
            loader: 'ts-loader',
            options: {
                transpileOnly: true,
                experimentalWatchApi: true,
            },
        },
    ],
    exclude: /node_modules/,
},
```

node_modules를 제외하고 .tsx?에 해당하는지 확인하고 해당할 경우 ts-loader를 통과하는데 transpileOnly 옵션과 experimentalWatchApi 옵션을 설정하고 통과하게된다.

## 그외 webpack optimization

```js
// ...
output: {
    pathinfo: false,
},
optimization: {
    removeAvailableModules: false,
    removeEmptyChunks: false,
    splitChunks: false,
},
// ...
```
Webpack의 공식 문서에서 개발 모드시에 켜두기를 권장하는 몇몇 설정들이 있다. `pathinfo` 설정의 경우엔 GC를 최소화 시킬 수 있고, 그 외의 `optimization` 옵션은 production시에는 필요하지만 개발 버전에서는 크게 유용하지 않은것들에 대한 기능들을 사용하지 않는것이다. (자세한 내용은 Webpack의 Build Performance 항목을 참조)

## Cache

이미 컴파일된 소스코드를 최대한 캐시하여 처리하여 빌드속도를 올릴 수 있다. 일반적으론 `cache-loader`를 사용한다. 하지만 `hard-source-webpack-plugin`가 더 성능이 좋은 경우가 있다고 하고, 비교 했을때 조금 더 성능이 나아져서 이쪽을 사용했다.

```js
// ...
plugins: [
    new ForkTsCheckerPlugin(),
    new HardSourcePlugin(),
],
// ...
```

## References

1. [Build Performance](https://webpack.js.org/guides/build-performance/)
1. [Speeding Up Webpack, Typescript Incremental Builds by 7x](https://medium.com/@kenneth_chau/speeding-up-webpack-typescript-incremental-builds-by-7x-3912ba4c1d15)
1. [Vue.js, TypeScript, webpack環境でバンドル速度を上げる](https://qiita.com/kurosame/items/81a23987048860097e60#%E3%82%AD%E3%83%A3%E3%83%83%E3%82%B7%E3%83%A5%E3%82%92%E4%BD%BF%E3%81%86)