function retornaAPI(){
    //Dados para realizar a consulta na API
    var timestamp = new Date().getTime()
    var apikey = 'a71e2d7702ed3ca494b554e7ffb9bf11'
    var kash = MD5(timestamp+'ebd77f15dd9775a580effe73ac94bcc9c1cefa28'+apikey)
    var retorno = []
    var list_personagem = []

    fetch('https://gateway.marvel.com:443/v1/public/characters?ts='+timestamp+'&apikey='+apikey+'&hash='+kash+'&limit=40')
        .then((response) => {
            return response.json()
        }).then((jsonparsed) => {
            //valido se o retorno foi OK
            if(jsonparsed.code == 200){
                var j=0
                jsonparsed.data.results.forEach(personagem => {
                    list_personagem.push(personagem.name.toLowerCase())
                    
                    //só exibo os personagens com fotos para ficar mais bonito
                    if(personagem.thumbnail.path.indexOf("image_not_available") == -1){
                        var logo = personagem.thumbnail.path+'.'+personagem.thumbnail.extension
                    } else {
                        var logo = 'assets/img/sem_imagem.png'
                    }
                    
                    //serie
                    let serie_limit = ''
                    let i=0
                    personagem.series.items.forEach(series => {
                        if(i<3){
                            serie_limit += '<p class="p-serie">'+series.name.substring(0,38)+'</p>'
                        }
                        i++
                    })
                    if(i==0) serie_limit = '<p class="p-serie">:( Infelizmente não participei de séries</p>'
                    let evento_limit = ''                    
                    let k=0
                    personagem.events.items.forEach(events => {
                        if(k<3){
                            evento_limit += '<p class="p-serie">'+events.name.substring(0,38)+'</p>'
                        }
                        k++
                    })
                    if(k==0) evento_limit = '<p class="p-serie">:( Infelizmente não participei de evento</p>'
                    let description = personagem.description == '' ? 'Nós da Marvel somos apaixonados pelo que fazemos, porém não fizemos a biografia deste personagem, quem sabe em breve!!' : personagem.description
                    retorno[j]= [logo,personagem.name,serie_limit,evento_limit,description]
                    j++
                })
                return retorno
            } else {
                alert('ERRO: Houve um erro na solicitação!!')
            }

        }).then((data) => {
            //definições iniciais
            let perPage = 4
            const state = {
                page:1,
                perPage,
                totalPage: Math.ceil(data.length/perPage),
                maxVisibleButtons:5
            }

            const html = {
                get(element) {
                    return document.querySelector(element)
                }
            }
            const controls = {
                next() {
                    state.page++
                    if(state.page > state.totalPage){
                        state.page--
                    }
                },
                prev() {
                    state.page--
                    if(state.page < 1){
                        state.page++
                    }
                },
                goTo(page) {
                    if(page < 1){
                        page = 1
                    }
                    state.page = +page
                    if(page > state.totalPage){
                        state.page = state.totalPage
                    }
                },
                createListeners() {
                    html.get('.first').addEventListener('click', () => {
                        controls.goTo(1)
                        update()
                    })

                    html.get('.last').addEventListener('click', () => {
                        controls.goTo(state.totalPage)
                        update()
                    })

                    html.get('.next').addEventListener('click', () => {
                        controls.next()
                        update()
                    })

                    html.get('.prev').addEventListener('click', () => {
                        controls.prev()
                        update()
                    })
                }
            }

            const list = {
                create(item) {
                    //crio a div da linha
                    const div = document.createElement('div')
                    div.classList.add('row')
                    div.classList.add('row-personagem')
                    //crio o disparador para abrir o detalhe
                    div.addEventListener('click', (event) => {
                        html.get('.md-nome-personagem').innerHTML = item[1]
                        html.get('.md-logo').innerHTML = '<img src="'+item[0]+'" alt="'+item[1]+'" width="144" height="144" class="img-personagem">'
                        html.get('.md-description').innerHTML = item[4]
                        html.get('.md-series').innerHTML = item[2]
                        html.get('.md-eventos').innerHTML = item[3]
                        html.get('.modal').classList.add('slide-modal')
                        
                    })
                    var element_row = html.get('#conteudo-personagem').appendChild(div)

                    //crio a div da logo
                    const div_logo_personagem = document.createElement('div')
                    div_logo_personagem.classList.add('item-personagens')
                    div_logo_personagem.classList.add('item-row')

                    var element_logo = element_row.appendChild(div_logo_personagem)

                    //Agora crio a div que irá a foto dentro
                    const div_logo = document.createElement('div')
                    div_logo.classList.add('logo-personagem')
                    div_logo.innerHTML = '<img src="'+item[0]+'" alt="'+item[1]+'" width="48" height="48" class="img-personagem">'
                    element_logo.appendChild(div_logo)
                    //crio a div do personagem
                    const div_personagem = document.createElement('div')
                    div_personagem.classList.add('nome-personagem')
                    div_personagem.innerHTML = item[1]
                    element_logo.appendChild(div_personagem)
                    //crio a div da série
                    const div_serie = document.createElement('div')
                    div_serie.classList.add('item-personagens')
                    div_serie.classList.add('item-column')
                    div_serie.innerHTML = item[2]
                    element_row.appendChild(div_serie)
                    //crio a div dos eventos
                    const div_event = document.createElement('div')
                    div_event.classList.add('item-personagens')
                    div_event.classList.add('item-column')
                    div_event.innerHTML = item[3]
                    element_row.appendChild(div_event)
                },
                update() {
                    html.get('#conteudo-personagem').innerHTML = ""
                    //lógica define o corte do array
                    let page = state.page - 1
                    let start = page * state.perPage
                    let end = start + state.perPage


                    let test_filtro = document.querySelector('.input').value.toLowerCase()
                    console.log(test_filtro);
                    //SE for filtrato, valido se tem item no array do personagem
                    if(test_filtro != ''){
                        const valida = list_personagem.indexOf(test_filtro);
                        if(valida >= 0){
                            start = valida
                            end = (valida+1)
                        }
                    }
                    console.log(start)
                    console.log(end)
                    //executo o corte do array
                    const paginatedItems = data.slice(start,end)
                    
                    //retiro a imagem carregando
                    const img = html.get('.load')
                    if(img) img.remove()
                    //envio para o create os itens do array
                    paginatedItems.forEach(list.create)
                }
            }

            const buttons = {
                numbers: html.get('.numbers'),
                create(number,mobile) {
                    const button = document.createElement('div')
                    
                    button.innerHTML = number
                    button.classList.add('paginate')
                    //incluo a classe que oculta o botão no caso de ser mobile
                    if(mobile)button.classList.add('paginate-mobile')
                    
                    if(state.page == number){
                        button.classList.add('active')
                    }
                    
                    button.addEventListener('click', (event) => {
                        const page = event.target.innerText
                        controls.goTo(page)
                        update()
                    })
                    
                    buttons.numbers.appendChild(button)
                },
                update() {
                    buttons.numbers.innerHTML = ''
                    const {maxLeft, maxRight,not_display} = buttons.calculateMaxVisible()
                    
                    for(let page = maxLeft; page <= maxRight; page++){
                        //valido se incluo a classe que oculta o menu ou não
                        let mobile = not_display.includes(page)
                        buttons.create(page,mobile)
                    }
                },
                calculateMaxVisible(){
                    const { maxVisibleButtons } = state
                    
                    //primeiro verifico a exibição dos botões genéricos
                    state.page < 3 ? html.get('.first').style.display = 'none' : html.get('.first').style.display = 'flex'
                    state.page < 2 ? html.get('.prev').style.display = 'none' : html.get('.prev').style.display = 'flex'
                    state.page > (state.totalPage-1) ? html.get('.next').style.display = 'none' : html.get('.next').style.display = 'flex'
                    state.page > (state.totalPage-2) ? html.get('.last').style.display = 'none' : html.get('.last').style.display = 'flex'

                    //calculo o número mínimo e máximo da paginação
                    let maxLeft = (state.page - Math.floor(maxVisibleButtons/2))
                    let maxRight = (state.page + Math.floor(maxVisibleButtons/2))
                    
                    //Não permito página negativa
                    if(maxLeft < 1){
                        maxLeft = 1
                        maxRight = maxVisibleButtons
                    }
                    
                    //Não permito que exploda o limite de paginas
                    if(maxRight > state.totalPage){
                        maxLeft = state.totalPage - (maxVisibleButtons - 1)
                        maxRight = state.totalPage

                        if(maxLeft < 1){
                            maxLeft = 1
                        }
                    }
                    //calculo quais botões não devem ser exibidos no mobile
                    let not_display
                    if(state.page <= 2) { not_display = [4,5] } else
                    if(state.page >= (state.totalPage-1)) { not_display = [maxLeft,(maxLeft+1)] } else {
                        not_display = [maxLeft,maxRight]
                    }
                    return {maxLeft, maxRight,not_display}
                }
            }
            function update(){
                list.update()
                buttons.update()
            }
            
            function init() {
                update()
                controls.createListeners()
            }
            document.querySelector('.input-search').addEventListener("click",function(e){
                init()
            },false)
            init()
        })
}

retornaAPI()


document.querySelector('#btnFechar').addEventListener("click",function(e){
    document.querySelector('.modal').classList.remove('slide-modal')
},false)