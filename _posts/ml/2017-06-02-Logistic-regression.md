---
layout: post
title:  "Logistic Regression"
date:   2017-06-02 03:48:00 +0900
categories: ml
description: 로지스틱 회귀를 텐서플로우로 구현해보기
keywords: logistic, regression, tensorflow, deep learning, ml, machine, learning
---

이전부터 간단한 머신러닝 기법(Decision tree, Random forest, XGBoost, ..)은 활용할 수 있었지만, 딥러닝을 공부해보고 싶은 욕심에 조금 더 다양하고 기본이 되는 알고리즘을 공부해보고 있습니다. 이를 위해 한국어 글로는 [조대협님의 블로그 글](http://bcho.tistory.com/1142)을 읽고 좀 더 자세한 정보를 위해서는 [Andrew Ng의 Machine learning 강의](https://www.coursera.org/learn/machine-learning#)를 보면서  Machine learning을 공부하고 있습니다.

Logistic regression 알고리즘은 classification에서 쉽게 사용할 수 있는 알고리즘이지만 위 [블로그의 글](http://bcho.tistory.com/1142)에 tensorflow를 이용해서 구현해본 예제가 없어서([Linear regression](http://bcho.tistory.com/1141)은 있습니다.) jupyter로 구현한 코드를 포스팅합니다.

```python
%matplotlib inline
import numpy as np
import matplotlib.pyplot as plt
```

## normalize


```python
s = np.random.normal(loc=0, scale=1.0, size=1000)
_ = plt.hist(s, 30, normed=True)
```


<img src="/assets/jupyter/logistic_regression/output_3_0.png" class="md-img">



```python
_ = plt.hist(np.abs(s), normed=True)
```


<img src="/assets/jupyter/logistic_regression/output_4_0.png" class="md-img">


**데이터를 가정해봅니다.**


```python
zs = np.array([[10 - np.random.rand() * 2, 0] for _ in range(10)])
os = np.array([[np.random.rand() * 2 + 10, 1] for _ in range(10)])
plt.plot(zs[:, 0], zs[:, 1], 'ro')
plt.plot(os[:, 0], os[:, 1], 'g^')
```








<img src="/assets/jupyter/logistic_regression/output_6_1.png" class="md-img">


## Sigmoid

$$ y = \frac{1}{1 + e^{-X}} $$


```python
xs = np.array(range(-20, 20))
```


```python
sigmoid = lambda xs: 1 / (1 + np.exp(-1 * xs))
plt.plot(xs, sigmoid(xs))
```


<img src="/assets/jupyter/logistic_regression/output_10_1.png" class="md-img">


g(z)를 sigmod함수라 가정하면,
$$ g(z) = \frac{1}{1 + e^{-z}} $$

가정(hypothesis) 함수는 아래와 같이 표현된다.
$$ h_\theta = g(\theta^Tx) $$

$$ y = 1 \: if \: h_\theta >= 0.5 $$

$$ y = 0 \: if \: h_\theta < 0.5 $$

$$ \theta^Tx는 선형적인 경우에 Wx + b로 가정할 수 있습니다.$$

위 데이터의 경우에는 W = 1, b = -2로 가정합니다.


```python
plt.plot(zs[:, 0], zs[:, 1], 'ro')
plt.plot(os[:, 0], os[:, 1], 'g^')
plt.plot(xs, sigmoid(xs - 10))
plt.xlim(5, 15)
```




    (5, 15)




<img src="/assets/jupyter/logistic_regression/output_13_1.png" class="md-img">


## cost function

if y = 1, cost function is
$$ cost = \frac{\sum -log(sigmoid(Wx + b))}{n} $$


```python
w = np.arange(0, 1, step=0.01)
f = lambda _w: np.sum(-np.log2(sigmoid(_w * os[:, 0] - 10))) / len(os)
vf = np.vectorize(f)
cost = vf(w)
plt.plot(w, cost)
```








<img src="/assets/jupyter/logistic_regression/output_15_1.png" class="md-img">


else if y = 0, cost function is
$$ cost = \frac{\sum -log(1 - sigmoid(Wx + b))}{n} $$


```python
w = np.arange(0, 1, step=0.01)
f = lambda _w: np.sum(-np.log2(1 - sigmoid(_w * zs[:, 0] - 10))) / len(zs)
vf = np.vectorize(f)
cost = vf(w)
plt.plot(w, cost)
```








<img src="/assets/jupyter/logistic_regression/output_17_1.png" class="md-img">


#### 따라서 cost function은,

$$ cost = \frac{\sum -y_{origin}log(sigmoid(Wx + b)) - (1 -y_{origin})log(1 - sigmoid(Wx + b))}{n} $$


```python
w = np.arange(0, 2, step=0.1)
orgs = np.concatenate((os, zs), axis=0)
f = lambda _w: np.sum(
    -orgs[:, 1] * np.log2(sigmoid(_w * orgs[:, 0] - 10)) - \
    (1 - orgs[:, 1]) * np.log2(1 - sigmoid(_w * orgs[:, 0] - 10))
) / orgs.size
cost_vf = np.vectorize(f)
cost = cost_vf(w)
plt.plot(w, cost)
```








<img src="/assets/jupyter/logistic_regression/output_19_1.png" class="md-img">


## 요소가 다양한경우

요소로 정의된 x가 다수일때,

$$ y = 1 \: if \: \theta_0 + \theta_1x_1 + \theta_2x_2 >= 0 $$

$$ y = 0 \: if \: \theta_0 + \theta_1x_1 + \theta_2x_2 < 0 $$

위의 예제 데이터에 반영해보기 위해서 theta값을 정의해보면
$$
\theta_0 = -20 \\
\theta_1 = 1 \\
\theta_2 = 1 \\
$$


```python
n_random = lambda: np.abs(np.random.normal(loc=0, scale=5))

zs = np.array([(n_random(), n_random()) for _ in range(100)])
os = np.array([(20 - n_random(), 20 - n_random()) for _ in range(100)])
```


```python
plt.plot(zs[:, 0], zs[:, 1], 'ro')
plt.plot(os[:, 0], os[:, 1], 'g^')
```








<img src="/assets/jupyter/logistic_regression/output_22_1.png" class="md-img">



```python
bound_x = np.array(range(20))
plt.plot(bound_x, -1 * bound_x + 20)
plt.plot(zs[:, 0], zs[:, 1], 'ro')
plt.plot(os[:, 0], os[:, 1], 'g^')
```








<img src="/assets/jupyter/logistic_regression/output_23_1.png" class="md-img">


## cost function


```python
w = np.arange(-2, 0.89, step=0.001)
_os = np.zeros((len(os), 3))
_os[:, :-1] = os
_zs = np.ones((len(zs), 3))
_zs[:, :-1] = zs

orgs = np.concatenate((_os, _zs), axis=0)
f = lambda _w: np.sum(
    -orgs[:, 2] * np.log2(sigmoid(_w * orgs[:, 0] + _w * orgs[:, 1])) - \
    (1 - orgs[:, 2]) * np.log2(1 - sigmoid(_w * orgs[:, 0]  + _w * orgs[:, 1]))
) / len(orgs)
cost_vf = np.vectorize(f)
cost = cost_vf(w)
plt.plot(w, cost)
```








<img src="/assets/jupyter/logistic_regression/output_25_1.png" class="md-img">


## tensorflow로 cost function 구하기


```python
import tensorflow as tf
from tensorflow import Variable
```


```python
w1 = Variable(tf.random_uniform(shape=[1], minval=-1, maxval=1), name="weight1")
w2 = Variable(tf.random_uniform(shape=[1], minval=-1, maxval=1), name="weight2")
b = Variable(tf.zeros(shape=[1]), name="biases")
```


```python
# hypothesis linear regression

t_sigmoid = lambda xs: 1 / (1 + tf.exp(-1 * xs))
dy = -orgs[:, 2] * tf.log(t_sigmoid(w1 * orgs[:, 0] + w2 * orgs[:, 1] + b)) - \
    (1 - orgs[:, 2]) * tf.log(1 - t_sigmoid(w1 * orgs[:, 0] + w2 * orgs[:, 1] + b))
delta = tf.reduce_mean(dy)
```

## Optimize


```python
optimize = tf.train.GradientDescentOptimizer(learning_rate=0.015)
train = optimize.minimize(delta)
```


```python
init = tf.global_variables_initializer()
sess = tf.Session()
sess.run(init)

for step in range(10000):
    sess.run(train)
    delta_r = sess.run(delta)
    w1_r = sess.run(w1)
    w2_r = sess.run(w2)
    b_r = sess.run(b)
print(w1_r, w2_r, b_r)
fig = plt.figure(1, figsize=(20, 20))
plt.plot(bound_x, (-w1_r * bound_x - b_r) / w2_r, label='predict')
plt.plot(zs[:, 0], zs[:, 1], 'ro', label='data_0')
plt.plot(os[:, 0], os[:, 1], 'g^', label='data_1')
plt.xlabel('x1')
plt.ylabel('x2')
plt.legend()
plt.show()
```

    [-0.34513682] [-0.36142468] [ 6.304564]



<img src="/assets/jupyter/logistic_regression/output_32_1.png">
