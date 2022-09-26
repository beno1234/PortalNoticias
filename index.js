const express = require('express')
const mongoose = require('mongoose');
const path = require('path')
var bodyParser = require('body-parser');

const app = express();

const Posts = require('./Posts')


mongoose.connect('mongodb+srv://beno:g2E8Bj9cwYHWcJdw@cluster0.005wv6d.mongodb.net/dankicode?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology: true}).then(function(){
    console.log('conectado com sucesso')
}).catch(function(err){
    console.log(err.message)
})



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}))

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use('/public', express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, '/pages'));

app.get('/', (req,res) => {

    if(req.query.busca == null){
        Posts.find({}).sort({'_id': -1}).exec(function(err,posts){
            //console.log(posts[0]);
            posts = posts.map(function(val){
                return {
                    titulo: val.titulo,
                    conteudo: val.conteudo,
                    descricaoCurta: val.conteudo.substr(0,100),
                    imagem: val.imagem,
                    slug: val.slug,
                    categoria: val.categoria
                }
            })

            Posts.find({}).sort({'views': -1}).limit(3).exec(function(err,postsTop){

                // console.log(posts[0]);

                 postsTop = postsTop.map(function(val){

                         return {

                             titulo: val.titulo,

                             conteudo: val.conteudo,

                             descricaoCurta: val.conteudo.substr(0,100),

                             imagem: val.imagem,

                             slug: val.slug,

                             categoria: val.categoria,

                             views: val.views

                             

                         }

                 })



                 



                 res.render('home',{posts:posts,postsTop:postsTop});

                

             })

        })
    }else{

        Posts.find({titulo: {$regex: req.query.busca,$options:"i"}}, function(err,posts){
            posts = posts.map(function(val){

                return {

                    titulo: val.titulo,

                    conteudo: val.conteudo,

                    descricaoCurta: val.conteudo.substr(0,100),

                    imagem: val.imagem,

                    slug: val.slug,

                    categoria: val.categoria,

                    views: val.views

                    

                }

        })
        res.render('busca', {posts:posts,contagem:posts.length})
    })


    }


})

app.get('/:slug',(req,res) => {
    //res.send(req.params.slug)
    Posts.findOneAndUpdate({slug: req.params.slug}, {$inc : {views: 1}}, {new: true}, function(err,resposta){
        //console.log(resposta)
        if(resposta != null){
            Posts.find({}).sort({'views': -1}).limit(3).exec(function(err,postsTop){
                postsTop = postsTop.map(function(val){
                    return {
                        titulo: val.titulo,

                        conteudo: val.conteudo,

                        descricaoCurta: val.conteudo.substr(0,100),

                        imagem: val.imagem,

                        slug: val.slug,

                        categoria: val.categoria,

                        views: val.views
                    }
                })
                res.render('single', {noticia:resposta, postsTop:postsTop})

            })
        }else{
            res.render('404.html')
        }

    })
})


app.listen(5000, ()=>{
    console.log('server rodando')
})