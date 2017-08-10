const { Chromeless } = require('chromeless')
const jsonfile = require('jsonfile')
const file = "./data.json"

const run = async (url,evaluate) => {
  const chromeless = new Chromeless({ })
  const data = await chromeless
    .goto(url)
    .evaluate(evaluate)
    .scrollTo(0,1000)

  await chromeless.end()
  return data
}

const fetchArticles = async () => {
  let data = undefined
  const url = "http://jk.gaogao.ninja"
  const evaluate = () => {
    const data = [].map.call(
      document.querySelectorAll('ul.post-list>li'),
      (element) => (
        { title: element.children[0].innerText, href: element.children[0].children[0].href }
      )
    )
    return JSON.stringify(data)
  }
  data = run(url,evaluate).catch(console.error.bind(console)) //get article title and href
  data = JSON.parse(await data)
  const promises = data.map(async (obj) => {
    const url = obj.href
    const evaluate = () => {
      return document.querySelector('.post-content').innerHTML
    }
    const data = run(url,evaluate).catch(console.error.bind(console))
    return {title: obj.title, content: await data}
  })
  articles = await Promise.all(promises)
  return articles
}

const fetchAlbums = async (url, category) => {
  let data = undefined
  const evaluate = () => {
    const data = [].map.call(
      document.querySelectorAll('a.click-able'),
      (element) => {
        e_element       = element.querySelector(".jk-card")
        const href      = element.href
        const img       = e_element.querySelector(".image-area > img").src
        const e_body    = e_element.querySelector(".jk-card-body")
        const title     = e_body.querySelector(".title").innerText
        const intro     = e_body.querySelector(".intro").innerText
        const author    = e_body.querySelector(".author").innerText.split(" ")[0]
        return {
          img: img,
          title: title,
          intro: intro,
          author: author,
          href: href
        }
      }
    )
    return JSON.stringify(data)
  }
  data = run(url, evaluate).catch(console.error.bind(console))
  data = await data
  data = JSON.parse(data).map((d)=>{ return Object.assign({category: category},d )})
  return data
}

const fetchCategories = async () => {
  let cameraman = await fetchAlbums("http://jk.gaogao.ninja/gallery/cameraman/", "cameraman")
  let jk = await fetchAlbums("http://jk.gaogao.ninja/gallery/jk/", "jk")
  let party = await fetchAlbums("http://jk.gaogao.ninja/gallery/party/", "party")
  const getPhotosByAlbum = async (album) => {
    let data = undefined
    const url = album.href
    const evaluate = () => {
      const data = [].map.call(
        document.querySelectorAll("img.show-photo"),
        (element) => {
          return { photo: element.src }
        }
      )
      return JSON.stringify(data)
    }
    data = await run(url, evaluate).catch(console.error.bind(console))
    return JSON.parse(data)
  }
  const mapInsertPhotosToAlbum = async (albums) => {
    promises = albums.map(async(album) => {
      const photos = await getPhotosByAlbum(album)
      const obj = Object.assign({photos: photos}, album)
      return obj
    })
    return await Promise.all(promises)
  }
  cameraman = await mapInsertPhotosToAlbum(cameraman)
  jk = await mapInsertPhotosToAlbum(jk)
  party = await mapInsertPhotosToAlbum(party)
  const albums = [].concat(cameraman, jk, party)
  return albums
}

const readFile = (file) => {
  new Promise((resolve, reject) => {
    jsonfile.readFile(file, function(err, data){
      result = data || {}
      resolve(result)
    })
  })
}

const writeFile = (file, obj) => {
  new Promise((resolve, reject) =>
    jsonfile.writeFile(file, obj, function(err){
      resolve(obj)
    })
  )
}

const save = (w_obj) => {
  const run = async () => {
    r_obj = await readFile(file)
    w_obj = Object.assign({}, r_obj, w_obj)
    return await writeFile(file, w_obj)
  }
  run()
}

const main = async () => {
  const albums = await fetchCategories()
  const articles = await fetchArticles()
  save(Object.assign({},{albums, articles}))
}

main()
