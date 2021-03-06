
var request = require('supertest');
var serve = require('..');
var koa = require('koa');

describe('serve(root)', function(){
  describe('when defer: false', function(){
    describe('when root = "."', function(){
      it('should serve from cwd', function(done){
        var app = koa();

        app.use(serve('.'));

        request(app.listen())
        .get('/package.json')
        .expect(200, done);
      })
    })

    describe('when path is not a file', function(){
      it('should 404', function(done){
        var app = koa();

        app.use(serve('test/fixtures'));

        request(app.listen())
        .get('/something')
        .expect(404, done);
      })
    })

    describe('when upstream middleware responds', function(){
      it('should respond', function(done){
        var app = koa();

        app.use(serve('test/fixtures'));

        app.use(function *(next){
          yield next;
          this.body = 'hey';
        });

        request(app.listen())
        .get('/hello.txt')
        .expect(200)
        .expect('world', done);
      })
    })

    describe('the path is valid', function(){
      it('should serve the file', function(done){
        var app = koa();

        app.use(serve('test/fixtures'));

        request(app.listen())
        .get('/hello.txt')
        .expect(200)
        .expect('world', done);
      })
    })

    describe('.index', function(){
      describe('when present', function(){
        it('should alter the index file supported', function(done){
          var app = koa();

          app.use(serve('test/fixtures', { index: 'index.txt' }));

          request(app.listen())
          .get('/')
          .expect(200)
          .expect('Content-Type', 'text/plain; charset=utf-8')
          .expect('text index', done);
        })
      })

      describe('when omitted', function(){
        it('should use index.html', function(done){
          var app = koa();

          app.use(serve('test/fixtures'));

          request(app.listen())
          .get('/world/')
          .expect(200)
          .expect('Content-Type', 'text/html; charset=utf-8')
          .expect('html index', done);
        })
      })
    })

    describe('when method is not `GET` or `HEAD`', function(){
      it('should 404', function(done){
        var app = koa();

        app.use(serve('test/fixtures'));

        request(app.listen())
        .post('/hello.txt')
        .expect(404, done);
      })
    })

    describe('when callback is specified', function(){
      it('should perform generator function callback', function(done){
        var app = koa();

        app.use(serve('test/fixtures', {
          callback: function*(ctx, path) {
            ctx.body = path;
          }
        }));

        request(app.listen())
        .get('/hello.txt')
        .expect(200)
        .expect(__dirname + '/fixtures/hello.txt', done);
      })
      it('should perform regular function callback', function(done){
        var app = koa();

        app.use(serve('test/fixtures', {
          callback: function(ctx, path) {
            ctx.body = path;
          }
        }));

        request(app.listen())
        .get('/hello.txt')
        .expect(200)
        .expect(__dirname + '/fixtures/hello.txt', done);
      })
    })

  })

  describe('when defer: true', function(){
    describe('when upstream middleware responds', function(){
      it('should do nothing', function(done){
        var app = koa();

        app.use(serve('test/fixtures', {
          defer: true
        }));

        app.use(function *(next){
          yield next;
          this.body = 'hey';
        });

        request(app.listen())
        .get('/hello.txt')
        .expect(200)
        .expect('hey', done);
      })
    })

    describe('the path is valid', function(){
      it('should serve the file', function(done){
        var app = koa();

        app.use(serve('test/fixtures', {
          defer: true
        }));

        request(app.listen())
        .get('/hello.txt')
        .expect(200)
        .expect('world', done);
      })
    })

    describe('.index', function(){
      describe('when present', function(){
        it('should alter the index file supported', function(done){
          var app = koa();

          app.use(serve('test/fixtures', {
            defer: true,
            index: 'index.txt'
          }));

          request(app.listen())
          .get('/')
          .expect(200)
          .expect('Content-Type', 'text/plain; charset=utf-8')
          .expect('text index', done);
        })
      })

      describe('when omitted', function(){
        it('should use index.html', function(done){
          var app = koa();

          app.use(serve('test/fixtures', {
          defer: true
        }));

          request(app.listen())
          .get('/world/')
          .expect(200)
          .expect('Content-Type', 'text/html; charset=utf-8')
          .expect('html index', done);
        })
      })
    })

    // describe('when path is a directory', function(){
    //   describe('and an index file is present', function(){
    //     it('should redirect missing / to -> / when index is found', function(done){
    //       var app = koa();

    //       app.use(serve('test/fixtures'));

    //       request(app.listen())
    //       .get('/world')
    //       .expect(303)
    //       .expect('Location', '/world/', done);
    //     })
    //   })

    //   describe('and no index file is present', function(){
    //     it('should not redirect', function(done){
    //       var app = koa();

    //       app.use(serve('test/fixtures'));

    //       request(app.listen())
    //       .get('/')
    //       .expect(404, done);
    //     })
    //   })
    // })

    describe('when path is not a file', function(){
      it('should 404', function(done){
        var app = koa();

        app.use(serve('test/fixtures', {
          defer: true
        }));

        request(app.listen())
        .get('/something')
        .expect(404, done);
      })
    })

    describe('it should not handle the request', function(){
      it('when status=204', function(done){
        var app = koa();

        app.use(serve('test/fixtures', {
          defer: true
        }));

        app.use(function *(next){
          this.status = 204;
        })

        request(app.listen())
        .get('/something%%%/')
        .expect(204, done);
      })

      it('when body=""', function(done){
        var app = koa();

        app.use(serve('test/fixtures', {
          defer: true
        }));

        app.use(function *(next){
          this.body = '';
        })

        request(app.listen())
        .get('/something%%%/')
        .expect(200, done);
      })
    })

    describe('when method is not `GET` or `HEAD`', function(){
      it('should 404', function(done){
        var app = koa();

        app.use(serve('test/fixtures', {
          defer: true
        }));

        request(app.listen())
        .post('/hello.txt')
        .expect(404, done);
      })
    })

    describe('when callback is specified', function(){
      it('should perform callback', function(done){
        var app = koa();

        app.use(serve('test/fixtures', {
          defer: true,
          callback: function*(ctx, path) {
            ctx.body = path;
          }
        }));

        request(app.listen())
        .get('/hello.txt')
        .expect(200)
        .expect(__dirname + '/fixtures/hello.txt', done);
      })
      it('should perform regular function callback', function(done){
        var app = koa();

        app.use(serve('test/fixtures', {
          defer: true,
          callback: function(ctx, path) {
            ctx.body = path;
          }
        }));

        request(app.listen())
        .get('/hello.txt')
        .expect(200)
        .expect(__dirname + '/fixtures/hello.txt', done);
      })
    })

  })

})
