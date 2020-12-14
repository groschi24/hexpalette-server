<div align="center">
  <a href="https://hexpalette.com"><img src="https://user-images.githubusercontent.com/7085454/102081174-18b75900-3e10-11eb-95af-58c3531b6590.jpg" alt="hexpalette.com logo" height="128"></a>
  <br>
  <br>
  <p>
    <b>Hexpalette - A fast color schemes generator for developers, designers. Create, share and save your perfect palettes in seconds!</b>
  </p>
  <p>

[![Website](https://img.shields.io/website?down_color=lightgrey&down_message=down&style=flat-square&up_color=green&up_message=up&url=https%3A%2F%2Fhexpalette.com%2F)](https://hexpalette.com)

  </p>
</div>

<div align="center" style="margin-top: 25px;margin-bottom: 25px;">
  <a href="https://hexpalette.com"><img src="https://user-images.githubusercontent.com/7085454/102082027-7ef0ab80-3e11-11eb-8038-ac33fec1278b.jpg" alt="Screenshot" width="100%"></a>
</div>

## Installation

## Local Setup

### build containers

```
docker-compose build
```

### start containers

```
docker-compose up
```

## Production Setup

### Pull Frontend

```
git clone https://github.com/groschi24/hexpalette.git
```

### build containers

```
docker-compose -f docker-compose.prod.yml build
```

### start containers

```
docker-compose -f docker-compose.prod.yml up -d
```

## Available Endpoints ( Local Setup )

|    Name    |            URL            |
| :--------: | :-----------------------: |
|    API     | http://localhost:8080/api |
