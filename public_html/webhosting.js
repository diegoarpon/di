var Dinamica = (function () {

    var instance;

    function cargarHeader() {
        fetch('https://wsapps.donweb.com/items/info_general?fields[]=*', {
            credentials: 'include'
        })
        .then(response => response.json())
        .then(data => {
            const header = data.data[0]; 
         
            const enlaceMiCuenta = document.querySelector('.btn-micuenta');
            const tituloElement = document.querySelector('#header .titulo-xl');
            const bajadaElement = document.querySelector('#header .bajada-m');
            const textoElement = document.querySelector('#header .texto-m');
            const footerElement = document.querySelector('#footer .donweb');

            enlaceMiCuenta.href = header.menu_boton_link;
            enlaceMiCuenta.textContent = header.menu_boton_texto;

            const converter = new showdown.Converter();

            tituloElement.innerHTML = converter.makeHtml(header.header_titulo);
            bajadaElement.innerHTML = converter.makeHtml(header.header_bajada);  
            textoElement.innerHTML = converter.makeHtml(header.header_parrafo);  
            footerElement.innerHTML = converter.makeHtml(header.footer_texto_donweb);   
      
        })
        .catch(error => console.error('Error al cargar el header:', error));
    }
    
    function cargarProductoDestacado() {
        fetch('https://wsapps.donweb.com/items/producto_destacado?fields[]=*', {
            credentials: 'include'
        })
        .then(response => response.json())
        .then(data => {
            const producto = data.data[0];

           document.querySelector('#producto-destacado .titulo-xm').textContent = producto.bajada;
           document.querySelector('#producto-destacado .titulo-l').textContent = producto.titulo;
           document.querySelector('#producto-destacado .bajada-m').textContent = producto.parrafo;

           const boton = document.querySelector('#producto-destacado .btn-secundario');
           boton.textContent = producto.boton_texto;
           boton.setAttribute('onclick', `window.open('${producto.boton_enlace}', '_blank')`);
   
           const imagen = document.querySelector('#producto-destacado .cont-img img');
           imagen.src = 'https://wsapps.donweb.com/assets/'+producto.imagen+'?fit=outside';  
        })
        .catch(error => console.error('Error al cargar el producto destacado:', error));
    }
    
    function cargarColumnas() {
        fetch('https://wsapps.donweb.com/items/columnas?fields[]=*', {
            credentials: 'include'
        })
        .then(response => response.json())
        .then(data => {
            const columnas = data.data;

            const container = document.getElementById('columnas');
        
            container.innerHTML = '';
    
            columnas.forEach(columna => {
        
                const columnaElement = document.createElement('div');
                columnaElement.classList.add('item-columna');
    
                if (columna.imagen) {
                    const imagen = document.createElement('img');
                    imagen.src = 'https://wsapps.donweb.com/assets/'+columna.imagen+'?fit=outside'; 
                    imagen.alt = columna.titulo;
                    imagen.classList.add('img-columna'); 
                    columnaElement.appendChild(imagen);
                }
    
                const titulo = document.createElement('p');
                titulo.textContent = columna.titulo;
                titulo.classList.add('titulo-s'); 
                columnaElement.appendChild(titulo);
    
                const link = document.createElement('a');
                link.href = columna.link;
                link.textContent = columna.texto_link;
                link.classList.add('link'); 
                link.target = '_blank'; 
                columnaElement.appendChild(link);
    
                container.appendChild(columnaElement);
            });
            
        })
        .catch(error => console.error('Error al cargar las columnas:', error));
    }
    
    function cargarFooter() {
        fetch('https://wsapps.donweb.com/items/footer?fields[]=*', {
            credentials: 'include'
        })
        .then(response => response.json())
        .then(data => {

        const sitiosOficialesContainer = document.getElementById('sitios-oficiales');
        const utilizanDonWebContainer = document.getElementById('utilizan-donweb');

       sitiosOficialesContainer.querySelectorAll('a').forEach(el => el.remove());
       utilizanDonWebContainer.querySelectorAll('a').forEach(el => el.remove());

        data.data.forEach(item => {
            const linkElement = document.createElement('a');
            linkElement.href = item.link_url;
            linkElement.target = '_blank'; 
            linkElement.textContent = item.link_texto;
            linkElement.classList.add('link'); 

            if (item.categoria === 'sitios_oficiales') {
                sitiosOficialesContainer.appendChild(linkElement);
            } else if (item.categoria === 'utilizan_donweb') {
                utilizanDonWebContainer.appendChild(linkElement);
            }
        });
         
        })
        .catch(error => console.error('Error al cargar el footer:', error));
    }

    instance = {
        cargarHeader: cargarHeader,
        cargarProductoDestacado: cargarProductoDestacado,
        cargarColumnas: cargarColumnas,
        cargarFooter: cargarFooter,
    };

    Object.freeze(instance);
    return instance;
})();

document.addEventListener('DOMContentLoaded', function () {
    Dinamica.cargarHeader();
    Dinamica.cargarProductoDestacado();
    Dinamica.cargarColumnas();
    Dinamica.cargarFooter();
});