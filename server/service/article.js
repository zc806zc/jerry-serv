import mongoose from 'mongoose'
const Article = mongoose.model('Article')

export async function fetchList(params) {
  const { page = 1, size = 20, type, isTop } = params
  let where = {}
  if (type) {
    where['type'] = type
  }
  if (isTop) {
    where['isTop'] = isTop === 'true'
  }
  // console.log(where)
  const data = await Article
    .find(where, { __v: 0, password: 0, content:0 })
    .skip((page - 1) * size)
    .limit(Number(size))
    .sort({ '_id': -1 })
    .populate({ path: 'type', select: 'name' })
    .populate({ path: 'tags', select: 'name' })
    .populate({ path: 'author', select: '_id username avatar' })
    .exec()

  return data
}

export async function fetchDetail({_id, username, userid}) {
  // TODO: [急]待优化fetchDetail时又自增又lean()问题
  let entity = await Article.findOne({ _id }, { __v: 0 }).lean()
  let model = await Article.findOne({ _id }, { __v: 0 })
  
  //////////// 待优化 
  // TODO: 修复lean()方法不包含虚拟字段问题(上中间件mongoose-lean-virtuals还是自己写？)
  model.clickNum++
  entity.likeNum = model.likeNum
  entity.commentNum = model.commentNum
  ////////////
  model.save()
 
  // default value （要不要节省流量不传递呢？）
  entity.isLike = false

  // 如果 存在点赞人list 且 传了参数 再去编译，节省系统开支
  if ((entity.likeList.length > 0) && (username || userid)) {
    const isHas = entity.likeList.some(i => i.username === username || i.userid === userid)
    if(isHas) {
      entity.isLike = true
    }
  }

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
  const res = await Article.remove({ _id })
  return res
}

export async function addLiker(params) {
  const data = await Article.addLiker(params)

  return data
}

export async function subLiker(params) {
  const data = await Article.subLiker(params)

  return data
}

export async function addComment(params) {
  const data = await Article.addComment(params)

  return data
}
