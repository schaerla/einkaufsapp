import { firestore } from '../firebase'

export default {

  /**
   * this function will be fired when you first time run the app,
   * and it will fetch first 4 posts, here I retrieve them in descending order, until the last added post appears first.
   * @returns 
   */
  postsFirstBatch: async function () {
    try {
      const data = await firestore
        .collection('global').doc('recipe').collection('entries')
        .orderBy("title", "asc")
        .limit(10)
        .get()

      let posts = []
      let lastKey = ""
      data.forEach((doc) => {
        posts.push({
          id: doc.id,
          postContent: doc.data(),
        })
        lastKey = doc
      })
      return { posts, lastKey }
    } catch (e) {
      console.log(e)
    }
  },

  /**
   * this function will be fired each time the user click on 'More Posts' button,
   * it receive key of last post in previous batch, then fetch next 4 posts
   * starting after last fetched post.
   * @param key is the obejct of the last loaded dataset
   * @returns 
   */
  postsNextBatch: async (key) => {
    try {
      const data = await firestore
        .collection('global').doc('recipe').collection('entries')
        .orderBy("title", "asc")
        .startAfter(key)
        .limit(4)
        .get()

      let posts = []
      let lastKey = ""
      data.forEach((doc) => {
        posts.push({
          id: doc.id,
          postContent: doc.data(),
        });
        lastKey = doc
      })
      return { posts, lastKey }
    } catch (e) {
      console.log(e)
    }
  },

  /**
   * this function will be fired when you first time run the app,
   * and it will fetch first 4 posts, here I retrieve them in descending order, until the last added post appears first.
   * @param userId is the id of the logged in user
   * @returns 
   */
  postsFirstBatchShList: async function (userId) {
    try {
      const data = await firestore
        .collection('global').doc('shoppinglist').collection('entries')
        .where('userId', "==", userId)
        .limit(10)
        .get()
      const data2 = await firestore
        .collection('global').doc('shoppinglist').collection('entries')
        .where('authorisation', 'array-contains', userId)
        .limit(10)
        .get()
      let posts = []
      let lastKey1 = ""
      let lastKey2 = ""
      data.forEach((doc) => {
        posts.push({
          id: doc.id,
          postContent: doc.data(),
        })
        lastKey1 = doc
      })
      data2.forEach((doc) => {
        posts.push({
          id: doc.id,
          postContent: doc.data(),
        })
        lastKey2 = doc
      })
      return { posts, lastKey1, lastKey2 }
    } catch (e) {
      console.log(e)
    }
  },

  /**
   * this function will be fired each time the user click on 'More Posts' button,
   * it receive key of last post in previous batch, then fetch next 4 posts
   * starting after last fetched post.
   * @param userId is the id of the logged in user
   * @param key1 is the obejct of the last loaded dataset ownList
   * @param key2 is the obejct of the last loaded dataset foreignList
   * @returns 
   */
  postsNextBatchShList: async (userId, key1, key2) => {
    try {
      const data = await firestore
        .collection('global').doc('shoppinglist').collection('entries')
        .where('userId', "==", userId)
        .startAfter(key1)
        .limit(4)
        .get()
      const data2 = await firestore
        .collection('global').doc('shoppinglist').collection('entries')
        .where('authorisation', 'array-contains', userId)
        .startAfter(key2)
        .limit(4)
        .get()
      let posts = []
      let lastKey1 = ""
      let lastKey2 = ""
      data.forEach((doc) => {
        posts.push({
          id: doc.id,
          postContent: doc.data(),
        });
        lastKey1 = doc
      })
      data2.forEach((doc) => {
        posts.push({
          id: doc.id,
          postContent: doc.data(),
        });
        lastKey2 = doc
      })
      return { posts, lastKey1, lastKey1 }
    } catch (e) {
      console.log(e)
    }
  }
}