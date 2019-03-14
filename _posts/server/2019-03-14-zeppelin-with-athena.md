---
layout: post
title: "Athena를 Zeppelin과 함께 쓰기"
date: 2019-03-14 19:16:00 +09:00
categories: server
description: "AWS Athena 쿼리를 Zeppelin에서 사용해보자"
keywords: "AWS, Athena, big data, apache, zeppelin"

---

회사 업무 중에 대용량의 데이터를 조회하고 분석할 일이 생겼다. 데이터는 DynamoDB에 쌓여있다. DynamoDB에서는 복잡한 조건을 갖고 쿼리를 할 수 있는 구조가 아니고, 가격과 성능 문제도 있기 때문에, 선택할 수 있는 도구에 대해서 수소문 해봤고, Google cloud platform에서 제공하는 [BigQuery](https://cloud.google.com/bigquery/)나 AWS에서 제공하는 [Athena](https://aws.amazon.com/ko/athena/)가 가장 편하고 흔하게 사용하는 듯 하다.

하지만 모든 데이터가 AWS의 DynamoDB에 있고, 회사에서는 이미 AWS를 적극적으로 사용중임으로,  BigQuery보다는 Athena를 선택하게 되었다.

DynamoDB에 있는 데이터를 S3에 쌓고 이를 Athena를 통해서 질의하는 방법에 대한 설명은 메가존에서 [번역한 AWS의 기술 블로그 글](https://cloud.hosting.kr/techblog_180612_your-amazon-dynamodb-data-by-using-amazon-athena/)이 있다.

이 글 안에, Athena로 질의한 내용에 대해서 시각화 하는 방법으로 AWS의 [QuickSight](https://aws.amazon.com/ko/quicksight/)를 사용했다. QuickSight는 데이터를 시각화하여 대시보드를 만들고 회사 내에 데이터를 공유하는데에 초점이 맞춰져 있다. 하지만 내가 하고 싶은 일은 질의를 통해서 데이터를 분석하는데에 초점이 맞춰있기 때문에 Notebook형식의 [Apache Zeppelin](https://zeppelin.apache.org/)이 더 편해보였다. 따라서 로컬에 Docker를 통해서 Zeppelin을 설치하고, Zeppelin에서 Athena에 쿼리할 수 있는 방법에 대해 자료가 부족하여 정리해보고자 했다.

## docker-compose을 이용한 Zeppelin 설치

Dockerhub에 이미 Apache에서 공식으로 제공하는 Zeppelin이 docker image가 있다. 관리를 위해서는 docker-compose를 이용해서 컨테이너를 만드는게 좋다. 우선 Zeppelin에서 작성한 노트북은 Host machine에서 접근할 수 있으면 좋겠고, Zeppelin의 기본 포트인 8080은 개발시에 자주 사용하는 포트인지라, 5000번 포트로 접근할 수 있도록 설정했다.

```yml
version: '3'

services:
  zeppelin:
    image: apache/zeppelin:0.8.1
    container_name: zeppelin-notebook
    ports:
      - "5000:8080"
    volumes:
      - ./notebook:/notebook
    environment:
      - ZEPPELIN_NOTEBOOK_DIR=/notebook
```

`$ docker-compose up --build`를 통해서 zeppelin을 실행하면 브라우저를 통해 http://localhost:5000 에서 쉽게 접근할 수 있다.

## Zeppelin과 Athena 연결

Zeppelin은 java를 이용해서 작성했고, 따라서 JDBC를 통해서 Athena에 접근한다. AWS에서는 JDBC 드라이버를 제공하고 있고 두 가지의 버전이 있는데 이 글에서는 최신 버전의 Athena JDBC 드라이버를 기준으로 설명한다. (이전 버전의 JDBC [다운로드 링크](https://docs.aws.amazon.com/ko_kr/athena/latest/ug/connect-with-previous-jdbc.html))

최신 Athena의 JDBC 드라이버는 [이 페이지](https://docs.aws.amazon.com/ko_kr/athena/latest/ug/connect-with-jdbc.html)에서 다운로드 받을 수 있다. docker-compose.yml에서 사용하고 있는 0.8.1버전의 zeppelin 이미지는 java 8이 돌아가고 있기 때문에 [AthenaJDBC42_2.0.6.jar](https://s3.amazonaws.com/athena-downloads/drivers/JDBC/SimbaAthenaJDBC_2.0.6/AthenaJDBC42_2.0.6.jar)를 다운로드 받아서 docker-compose.yml의 디렉토리에 jar라는 서브 디렉토리를 만들어서 다운로드 받은 jar파일을 저장했다.

이제 다운로드 받은 jar 파일과 AWS의 credential 디렉토리(AWS의 자격증명 만들기에 대한 설명은 [여기에](https://docs.aws.amazon.com/ko_kr/AmazonS3/latest/dev/AuthUsingAcctOrUserCredentials.html))를 docker-compose.yml을 통해서 zeppelin이 동작 중인 컨테이너와 연결시켜 준다.

```
version: '3'

services:
  zeppelin:
    image: apache/zeppelin:0.8.1
    container_name: zeppelin-notebook
    ports:
      - "5000:8080"
    volumes:
      - ./notebook:/notebook
      - ./jar:/usr/local/jar
      - ~/.aws:/root/.aws
    environment:
      - ZEPPELIN_NOTEBOOK_DIR=/notebook
```

이제 `docker-compose up --build`를 다시 실행해서 컨테이너를 재시작 시켜주고, zeppelin에 접속해서 athena interpreter를 설정해준다.

![]({{ site_url }}/assets/zeppelin-home.png)

zeppelin에 다시 접속하여 계정 이름을 클릭하면 zeppelin에 있는 모든 인터프리터를 볼 수 있는Interpreters 메뉴가 있다.

![]({{ site_url }}/assets/zeppelin-create-interpreter.png)

새로운 인터프리터를 만들어야하는데 `Interpreter Name`은 적당히 athena로 정하고, `Interpreter group`은 jdbc로 설정했다. jdbc로 설정하면 `Properties`가 자동으로 채워지는데, 이 중에 몇 가지를 바꿔야한다. `default.driver`는 `com.simba.athena.jdbc.Driver`로 설정하고, `default.url`은 굉장히 긴 텍스트를 설정해야한다.

```
jdbc:awsathena://athena.ap-northeast-2.amazonaws.com:443;S3OutputLocation=s3://aws-athena-query-results-...-ap-northeast-2;Schema=default;AwsCredentialsProviderClass=com.simba.athena.amazonaws.auth.profile.ProfileCredentialsProvider;AwsCredentialsProviderArguments="..."
```

하나씩 보면

- jdbc:awsathena://athena.ap-northeast-2.amazonaws.com:443 리전코드만 athena에 따라 바꾸면 된다.
- S3OutputLocation=s3://aws-athena-query-results-...-ap-northeast-2  쿼리 결과가 저장되는 S3 위치를 설정하면 된다. Athena의 AWS Console에 Settings를 살펴보면 기본 Query result locaiton을 알 수 있다.
- Schema=default 사용할 스키마를 설정한다.
- AwsCredentialsProviderClass=com.simba.athena.amazonaws.auth.profile.ProfileCredentialsProvider 건드릴 필요 없다.
- AwsCredentialsProviderArguments="..." Credential의 이름을 정하면 되는듯하다. 이름은 ~/.aws/credential 내용의 대괄호 안의 내용이다. 일반적으론 default로 설정되어 있다.

`default.user`와 `default.password`를 비워두고 `Dependecies`의 `artifact`를 /usr/local/jar/AthenaJDBC42_2.0.6.jar로 설정하면 AWS에서 다운로드 받은 JAR 파일을 zeppelin이 사용하도록 설정할 수 있다.

Save하고 새로운 노트북을 만들면 athena로 쿼리를 보낼 수 있다.

![]({{ site_url }}/assets/zeppelin-query.png)
