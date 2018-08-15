import mongoose from 'mongoose'
const Article = mongoose.model('Article')

export async function fetchList(page = 1, size = 20) {
  const data = await Article.find().skip((page - 1) * size).limit(Number(size)).sort({ '_id': -1 }).exec()

  return data
}

export async function fetchDetail(_id) {
  const entity = await Article.findOne(_id).exec()

  return entity
}

export async function create(model) {
  model = new Article(model)
  model = await model.save()

  return model
}

export async function update(model) {
  try {
    let entity = await Article.findOne({ _id: model._id }).exec()

    //TODO: no data

    delete model._id
    entity = Object.assign(entity, model)
    entity = await entity.save()

    return entity

  } catch (err) {
    console.error(err)
  }
}

export async function remove(_id) {
  await Article.remove({_id})

  return true
}
