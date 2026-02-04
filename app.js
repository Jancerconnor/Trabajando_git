

// Lista de productos (actualizados a Heladería)
let productos = [
    {id: 1, nombre: "Cubo de Helado", precio: 700, cantidad: 15},
    {id: 2, nombre: "Helado de vaso 60", precio: 50, cantidad: "—"},
    {id: 3, nombre: "Helado de vaso 100", precio: 100, cantidad: "—"},
    {id: 4, nombre: "Helado de vaso 125", precio: 125, cantidad: "—"},
    {id: 5, nombre: "Helado de vaso 150", precio: 150, cantidad: "—"},
    {id: 6, nombre: "Helado de vaso 200", precio: 200, cantidad: "—"},
    {id: 7, nombre: "Paleta de Fruta", precio: 15, cantidad: 20},
    {id: 8, nombre: "Paleta de Chocolate", precio: 30, cantidad: 20},
    {id: 9, nombre: "Paleta de Bizcocho", precio: 30, cantidad: 20},
    {id: 10, nombre: "Paleta de Chocolate con Leche", precio: 35, cantidad: 20},
    {id: 11, nombre: "Choco Fresa", precio: 40, cantidad: 20},
    {id: 12, nombre: "Choco Maní", precio: 50, cantidad: 20},
    {id: 13, nombre: "Barquilla Normal", precio: 25, cantidad: 20},
    {id: 14, nombre: "Barquilla Barquito", precio: 50, cantidad: 20}
];

// LocalStorage inicial
if(!localStorage.getItem('productos')){
    localStorage.setItem('productos', JSON.stringify(productos));
} else {
    productos = JSON.parse(localStorage.getItem('productos'));
}

// Carrito y clientes
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
let clientes = JSON.parse(localStorage.getItem('clientes')) || [];

// ====== Funciones ======

// Mostrar productos
function mostrarProductos(lista = productos){
    const contenedor = document.getElementById('productos-contenedor');
    contenedor.innerHTML = '';

    lista.forEach(producto => {
        const esIlimitado = producto.cantidad === null || producto.cantidad === "—";
        const agotado = !esIlimitado && producto.cantidad === 0;

        contenedor.innerHTML += `
            <div class="producto ${agotado ? 'agotado' : ''}">
                <h4>${producto.nombre}</h4>
                <p>ID: ${producto.id}</p>
                <p>Precio: $${producto.precio}</p>
                <p>Stock: ${esIlimitado ? 'Ilimitado' : producto.cantidad}</p>
                <button onclick="agregarAlCarrito(${producto.id})" ${agotado ? 'disabled' : ''}>
                    ${agotado ? 'Agotado' : 'Agregar al carrito'}
                </button>
                <button onclick="editarProducto(${producto.id})" class="btn-editar">✏️ Editar</button>
            </div>
        `;
    });

    // Actualizar productos agotados automáticamente
    mostrarProductosAgotados();
}

// ====== Mostrar productos agotados (≤ 5) ======
function mostrarProductosAgotados(){
    const contenedor = document.getElementById('productos-agotados');
    contenedor.innerHTML = '';
    const agotados = productos.filter(p => p.cantidad !== "—" && p.cantidad !== null && p.cantidad <= 5);
    if(agotados.length === 0){
        contenedor.innerHTML = '<p>No hay productos con stock crítico.</p>';
        return;
    }
    agotados.forEach(p => {
        contenedor.innerHTML += `<div>${p.nombre} - Stock: ${p.cantidad}</div>`;
    });
}

// Buscar productos por nombre o ID
document.getElementById('busqueda-producto').addEventListener('input', function(){
    const texto = this.value.toLowerCase();
    const filtrados = productos.filter(p => 
        p.nombre.toLowerCase().includes(texto) || p.id.toString() === texto
    );
    mostrarProductos(filtrados);
});

// ====== Editar producto ======
function editarProducto(id){
    const producto = productos.find(p => p.id === id);
    if(!producto) return alert("Producto no encontrado");

    const nuevoPrecio = prompt(`Nuevo precio para ${producto.nombre}:`, producto.precio);
    if(nuevoPrecio === null || nuevoPrecio === "") return;

    const nuevaCantidad = prompt(`Nueva cantidad para ${producto.nombre}: (usa "—" para ilimitado)`, producto.cantidad);
    if(nuevaCantidad === null || nuevaCantidad === "") return;

    producto.precio = parseFloat(nuevoPrecio);
    producto.cantidad = isNaN(nuevaCantidad) ? nuevaCantidad : parseInt(nuevaCantidad);

    localStorage.setItem('productos', JSON.stringify(productos));
    mostrarProductos();
    alert(`Producto "${producto.nombre}" actualizado correctamente ✅`);
}

// Agregar producto al carrito
function agregarAlCarrito(id){
    const producto = productos.find(p => p.id === id);

    if(producto.cantidad > 0 || producto.cantidad === null || producto.cantidad === "—"){
        const enCarrito = carrito.find(p => p.id === id);
        if(enCarrito){
            enCarrito.cantidad++;
        } else {
            carrito.push({...producto, cantidad: 1});
        }

        if(producto.cantidad !== "—" && producto.cantidad !== null){
            producto.cantidad--;
        }

        localStorage.setItem('productos', JSON.stringify(productos));
        localStorage.setItem('carrito', JSON.stringify(carrito));

        mostrarProductos();
        mostrarCarrito();
    } else {
        alert('Producto agotado');
    }
}

// Mostrar carrito
function mostrarCarrito(){
    const contenedor = document.getElementById('carrito-contenedor');
    contenedor.innerHTML = '';

    if(carrito.length === 0){
        contenedor.innerHTML = '<p>El carrito está vacío.</p>';
        document.getElementById('total').innerText = '0';
        return;
    }

    let total = 0;
    carrito.forEach((p, index) => {
        const subtotal = p.precio * p.cantidad;
        total += subtotal;
        contenedor.innerHTML += `
            <div class="producto-carrito">
                <h4>${p.nombre}</h4>
                <p>$${p.precio} × ${p.cantidad} = $${subtotal}</p>
                <button onclick="eliminarDelCarrito(${index})">Eliminar</button>
            </div>
        `;
    });

    document.getElementById('total').innerText = total;
}

// Eliminar producto del carrito
function eliminarDelCarrito(index){
    const producto = carrito[index];
    carrito.splice(index,1);

    const productoOriginal = productos.find(p => p.id === producto.id);
    if(productoOriginal && productoOriginal.cantidad !== "—" && productoOriginal.cantidad !== null){
        productoOriginal.cantidad += producto.cantidad;
    }

    localStorage.setItem('carrito', JSON.stringify(carrito));
    localStorage.setItem('productos', JSON.stringify(productos));
    mostrarCarrito();
    mostrarProductos();
}

// Facturar
function facturar(){
    if(carrito.length === 0){
        alert('El carrito está vacío');
        return;
    }

    let nombreCliente = prompt("Ingrese el nombre del cliente");

    const total = carrito.reduce((acc,p) => acc + (p.precio * p.cantidad), 0);

    const factura = {
        cliente: {nombre: nombreCliente}, 
        productos: carrito,
        total: total,
        fecha: new Date().toISOString()
    };

    let facturas = JSON.parse(localStorage.getItem('facturas')) || [];
    facturas.push(factura);
    localStorage.setItem('facturas', JSON.stringify(facturas));

    alert(`Factura generada para ${nombreCliente}!\nTotal: $${total}`);

    carrito = [];
    localStorage.setItem('carrito', JSON.stringify(carrito));
    localStorage.setItem('productos', JSON.stringify(productos));

    mostrarCarrito();
    mostrarProductos();
}

// ====== Clientes ======
function mostrarClientes(){
    const contenedor = document.getElementById('lista-clientes');
    contenedor.innerHTML = '';

    if(clientes.length === 0){
        contenedor.innerHTML = '<p>No hay clientes registrados.</p>';
        return;
    }

    clientes.forEach((c, index) => {
        contenedor.innerHTML += `
            <div>
                ${c.nombre} 
                <button onclick="eliminarCliente(${index})">❌ Eliminar</button>
            </div>
        `;
    });
}

// ====== Eliminar cliente ======
function eliminarCliente(index){
    if(confirm(`¿Seguro que quieres eliminar al cliente ${clientes[index].nombre}?`)){
        clientes.splice(index, 1);
        localStorage.setItem('clientes', JSON.stringify(clientes));
        mostrarClientes();
    }
}

// ====== Agregar cliente ======
document.getElementById('form-cliente').addEventListener('submit', function(e){
    e.preventDefault();
    const nombre = document.getElementById('nombre-cliente').value;

    clientes.push({nombre});
    localStorage.setItem('clientes', JSON.stringify(clientes));

    document.getElementById('form-cliente').reset();
    mostrarClientes();
});

// ====== Facturas visibles ======
function mostrarFacturas(){
    const contenedor = document.getElementById('lista-facturas');
    const facturas = JSON.parse(localStorage.getItem('facturas')) || [];
    contenedor.innerHTML = '';

    facturas.forEach((f, index) => {
        let productosHTML = f.productos.map(p => `<li>${p.nombre} - $${p.precio} × ${p.cantidad} = $${p.precio * p.cantidad}</li>`).join('');
        contenedor.innerHTML += `
            <div class="factura">
                <h4>HELADERÍA SPLASH</h4>
                <p>Cliente: ${f.cliente.nombre}</p>
                <ul>${productosHTML}</ul>
                <p>Total: $${f.total}</p>
                <p>Fecha: ${f.fecha}</p>
                <button onclick="imprimirFactura(${index})">Ver / Imprimir</button>
            </div>
        `;
    });
}

// ====== Imprimir solo una factura ======
function imprimirFactura(index){
    const facturas = JSON.parse(localStorage.getItem('facturas')) || [];
    const f = facturas[index];
    if(!f) return alert("Factura no encontrada");

    let ventana = window.open('', '_blank');
    ventana.document.write(`
        <html>
        <head>
            <title>Factura</title>
            <style>
                body { font-family: Arial; padding: 20px; }
                h2 { color: #0077cc; }
                ul { list-style: none; padding: 0; }
                li { margin-bottom: 5px; }
            </style>
        </head>
        <body>
            <h2>HELADERÍA SPLASH</h2>
            <p>Cliente: ${f.cliente.nombre}</p>
            <ul>
                ${f.productos.map(p => `<li>${p.nombre} - $${p.precio} × ${p.cantidad} = $${p.precio * p.cantidad}</li>`).join('')}
            </ul>
            <h3>Total: $${f.total}</h3>
            <p>Fecha: ${f.fecha}</p>
        </body>
        </html>
    `);
    ventana.document.close();
    ventana.print();
}

// ====== Limpiar todas las facturas ======
function limpiarFacturas(){
    if(confirm("¿Seguro que quieres eliminar todas las facturas?")){
        localStorage.removeItem('facturas');
        mostrarFacturas();
        alert("Todas las facturas han sido eliminadas.");
    }
}

// ====== Cuadre del día ======
function mostrarCuadre(){
    const contenedor = document.getElementById('lista-cuadre');
    const facturas = JSON.parse(localStorage.getItem('facturas')) || [];

    let ventasHoy = facturas.filter(f => {
        const fechaFactura = new Date(f.fecha);
        const hoy = new Date();
        return fechaFactura.getDate() === hoy.getDate() &&
               fechaFactura.getMonth() === hoy.getMonth() &&
               fechaFactura.getFullYear() === hoy.getFullYear();
    });

    contenedor.innerHTML = `<h3>Cuadre del Día</h3>`;

    if(ventasHoy.length === 0){
        contenedor.innerHTML += "<p>No hay ventas registradas hoy.</p>";
        return;
    }

    let totalDia = 0;
    ventasHoy.forEach((f) => {
        let productosHTML = f.productos.map(p => `<li>${p.nombre} - $${p.precio} × ${p.cantidad} = $${p.precio * p.cantidad}</li>`).join('');
        contenedor.innerHTML += `
            <div class="factura">
                <h4>HELADERÍA SPLASH</h4>
                <p>Cliente: ${f.cliente.nombre}</p>
                <ul>${productosHTML}</ul>
                <p>Total: $${f.total}</p>
                <p>Fecha: ${new Date(f.fecha).toLocaleString()}</p>
            </div>
        `;
        totalDia += f.total;
    });

    contenedor.innerHTML += `<h3>Total del Día: $${totalDia}</h3>`;
}

// ====== Navegación de secciones ======
function mostrarSeccion(seccion){
    const secciones = document.querySelectorAll('.seccion');
    secciones.forEach(sec => sec.style.display = 'none');
    document.getElementById(seccion).style.display = 'block';
}


const toggleBtn = document.getElementById('toggle-modo');

toggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('noche');

    if(document.body.classList.contains('noche')){
        toggleBtn.textContent = '☀️ Modo Día';
    } else {
        toggleBtn.textContent = '🌙 Modo Noche';
    }

    // Guardar la preferencia en localStorage
    localStorage.setItem('modo', document.body.classList.contains('noche') ? 'noche' : 'dia');
});

// Al cargar la página, aplicar la preferencia guardada
const modoGuardado = localStorage.getItem('modo');
if(modoGuardado === 'noche'){
    document.body.classList.add('noche');
    toggleBtn.textContent = '☀️ Modo Día';
}

// ====== Inicialización ======
mostrarProductos();
mostrarCarrito();
mostrarClientes();
