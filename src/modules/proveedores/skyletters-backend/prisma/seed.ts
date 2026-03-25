// prisma/seed.ts
// Datos iniciales: roles, permisos, usuario admin y plan de cuentas básico colombiano

import { PrismaClient, TipoCuenta, NaturalezaCuenta, TipoImpuesto } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de SKYLETTERS...\n');

  // ─── 1. PERMISOS ───────────────────────────────────────────────────────────
  const MODULOS = ['asientos', 'reportes', 'usuarios', 'impuestos', 'parametrizacion', 'conciliacion'];
  const ACCIONES = ['leer', 'crear', 'actualizar', 'eliminar', 'aprobar', 'anular', 'admin'];

  const permisosData = MODULOS.flatMap((modulo) =>
    ACCIONES.map((accion) => ({ modulo, accion, descripcion: `${accion} en ${modulo}` }))
  );

  for (const p of permisosData) {
    await prisma.permiso.upsert({
      where: { modulo_accion: { modulo: p.modulo, accion: p.accion } },
      update: {},
      create: p,
    });
  }
  console.log(`✅ ${permisosData.length} permisos creados`);

  // ─── 2. ROLES ──────────────────────────────────────────────────────────────
  const todosLosPermisos = await prisma.permiso.findMany();

  // Rol Administrador - acceso total
  const rolAdmin = await prisma.rol.upsert({
    where: { nombre: 'Administrador' },
    update: {},
    create: {
      nombre: 'Administrador',
      descripcion: 'Acceso completo al sistema',
      permisos: { connect: todosLosPermisos.map((p) => ({ id: p.id })) },
    },
  });

  // Rol Contador - acceso contable completo
  const permisosContador = todosLosPermisos.filter(
    (p) => !['usuarios', 'parametrizacion'].includes(p.modulo) || p.accion === 'leer'
  );
  const rolContador = await prisma.rol.upsert({
    where: { nombre: 'Contador' },
    update: {},
    create: {
      nombre: 'Contador',
      descripcion: 'Gestión completa de asientos y reportes',
      permisos: { connect: permisosContador.map((p) => ({ id: p.id })) },
    },
  });

  // Rol Auxiliar - solo lectura + crear borradores
  const permisosAuxiliar = todosLosPermisos.filter(
    (p) => p.accion === 'leer' || (p.modulo === 'asientos' && p.accion === 'crear')
  );
  await prisma.rol.upsert({
    where: { nombre: 'Auxiliar Contable' },
    update: {},
    create: {
      nombre: 'Auxiliar Contable',
      descripcion: 'Puede crear borradores y ver reportes',
      permisos: { connect: permisosAuxiliar.map((p) => ({ id: p.id })) },
    },
  });

  console.log('✅ 3 roles creados (Administrador, Contador, Auxiliar Contable)');

  // ─── 3. USUARIO ADMINISTRADOR ──────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('Admin123!', 12);
  await prisma.usuario.upsert({
    where: { email: 'admin@cartasalcielo.com' },
    update: {},
    create: {
      nombre: 'Administrador',
      apellido: 'Sistema',
      email: 'admin@cartasalcielo.com',
      passwordHash: adminPassword,
      rolId: rolAdmin.id,
    },
  });

  const contadorPassword = await bcrypt.hash('Contador123!', 12);
  await prisma.usuario.upsert({
    where: { email: 'contador@cartasalcielo.com' },
    update: {},
    create: {
      nombre: 'María',
      apellido: 'González',
      email: 'contador@cartasalcielo.com',
      passwordHash: contadorPassword,
      rolId: rolContador.id,
    },
  });

  console.log('✅ Usuarios creados');
  console.log('   📧 admin@cartasalcielo.com | 🔑 Admin123!');
  console.log('   📧 contador@cartasalcielo.com | 🔑 Contador123!\n');

  // ─── 4. PLAN DE CUENTAS (PUC Colombia simplificado) ────────────────────────
  type CuentaInput = {
    codigo: string;
    nombre: string;
    tipo: TipoCuenta;
    naturaleza: NaturalezaCuenta;
    nivel: number;
    acepta_movimientos: boolean;
    codigoPadre?: string;
  };

  const planCuentas: CuentaInput[] = [
    // ACTIVOS
    { codigo: '1', nombre: 'ACTIVO', tipo: 'ACTIVO', naturaleza: 'DEBITO', nivel: 1, acepta_movimientos: false },
    { codigo: '11', nombre: 'Disponible', tipo: 'ACTIVO', naturaleza: 'DEBITO', nivel: 2, acepta_movimientos: false, codigoPadre: '1' },
    { codigo: '1105', nombre: 'Caja', tipo: 'ACTIVO', naturaleza: 'DEBITO', nivel: 3, acepta_movimientos: true, codigoPadre: '11' },
    { codigo: '1110', nombre: 'Bancos', tipo: 'ACTIVO', naturaleza: 'DEBITO', nivel: 3, acepta_movimientos: true, codigoPadre: '11' },
    { codigo: '13', nombre: 'Deudores', tipo: 'ACTIVO', naturaleza: 'DEBITO', nivel: 2, acepta_movimientos: false, codigoPadre: '1' },
    { codigo: '1305', nombre: 'Clientes', tipo: 'ACTIVO', naturaleza: 'DEBITO', nivel: 3, acepta_movimientos: true, codigoPadre: '13' },
    { codigo: '1355', nombre: 'Anticipo a proveedores', tipo: 'ACTIVO', naturaleza: 'DEBITO', nivel: 3, acepta_movimientos: true, codigoPadre: '13' },
    { codigo: '14', nombre: 'Inventarios', tipo: 'ACTIVO', naturaleza: 'DEBITO', nivel: 2, acepta_movimientos: false, codigoPadre: '1' },
    { codigo: '1435', nombre: 'Mercancías no fabricadas', tipo: 'ACTIVO', naturaleza: 'DEBITO', nivel: 3, acepta_movimientos: true, codigoPadre: '14' },
    { codigo: '15', nombre: 'Propiedades, planta y equipo', tipo: 'ACTIVO', naturaleza: 'DEBITO', nivel: 2, acepta_movimientos: false, codigoPadre: '1' },
    { codigo: '1524', nombre: 'Equipo de oficina', tipo: 'ACTIVO', naturaleza: 'DEBITO', nivel: 3, acepta_movimientos: true, codigoPadre: '15' },
    { codigo: '1528', nombre: 'Equipo de cómputo', tipo: 'ACTIVO', naturaleza: 'DEBITO', nivel: 3, acepta_movimientos: true, codigoPadre: '15' },

    // PASIVOS
    { codigo: '2', nombre: 'PASIVO', tipo: 'PASIVO', naturaleza: 'CREDITO', nivel: 1, acepta_movimientos: false },
    { codigo: '22', nombre: 'Proveedores', tipo: 'PASIVO', naturaleza: 'CREDITO', nivel: 2, acepta_movimientos: false, codigoPadre: '2' },
    { codigo: '2205', nombre: 'Proveedores nacionales', tipo: 'PASIVO', naturaleza: 'CREDITO', nivel: 3, acepta_movimientos: true, codigoPadre: '22' },
    { codigo: '23', nombre: 'Cuentas por pagar', tipo: 'PASIVO', naturaleza: 'CREDITO', nivel: 2, acepta_movimientos: false, codigoPadre: '2' },
    { codigo: '2335', nombre: 'Costos y gastos por pagar', tipo: 'PASIVO', naturaleza: 'CREDITO', nivel: 3, acepta_movimientos: true, codigoPadre: '23' },
    { codigo: '2365', nombre: 'Retención en la fuente por pagar', tipo: 'PASIVO', naturaleza: 'CREDITO', nivel: 3, acepta_movimientos: true, codigoPadre: '23' },
    { codigo: '2367', nombre: 'Impuesto a las ventas retenido', tipo: 'PASIVO', naturaleza: 'CREDITO', nivel: 3, acepta_movimientos: true, codigoPadre: '23' },
    { codigo: '24', nombre: 'Impuestos por pagar', tipo: 'PASIVO', naturaleza: 'CREDITO', nivel: 2, acepta_movimientos: false, codigoPadre: '2' },
    { codigo: '2408', nombre: 'IVA por pagar', tipo: 'PASIVO', naturaleza: 'CREDITO', nivel: 3, acepta_movimientos: true, codigoPadre: '24' },

    // PATRIMONIO
    { codigo: '3', nombre: 'PATRIMONIO', tipo: 'PATRIMONIO', naturaleza: 'CREDITO', nivel: 1, acepta_movimientos: false },
    { codigo: '31', nombre: 'Capital social', tipo: 'PATRIMONIO', naturaleza: 'CREDITO', nivel: 2, acepta_movimientos: false, codigoPadre: '3' },
    { codigo: '3105', nombre: 'Capital suscrito y pagado', tipo: 'PATRIMONIO', naturaleza: 'CREDITO', nivel: 3, acepta_movimientos: true, codigoPadre: '31' },
    { codigo: '36', nombre: 'Resultados del ejercicio', tipo: 'PATRIMONIO', naturaleza: 'CREDITO', nivel: 2, acepta_movimientos: false, codigoPadre: '3' },
    { codigo: '3605', nombre: 'Utilidad del ejercicio', tipo: 'PATRIMONIO', naturaleza: 'CREDITO', nivel: 3, acepta_movimientos: true, codigoPadre: '36' },

    // INGRESOS
    { codigo: '4', nombre: 'INGRESOS', tipo: 'INGRESO', naturaleza: 'CREDITO', nivel: 1, acepta_movimientos: false },
    { codigo: '41', nombre: 'Operacionales', tipo: 'INGRESO', naturaleza: 'CREDITO', nivel: 2, acepta_movimientos: false, codigoPadre: '4' },
    { codigo: '4135', nombre: 'Comercio al por mayor y menor', tipo: 'INGRESO', naturaleza: 'CREDITO', nivel: 3, acepta_movimientos: true, codigoPadre: '41' },
    { codigo: '4155', nombre: 'Servicios', tipo: 'INGRESO', naturaleza: 'CREDITO', nivel: 3, acepta_movimientos: true, codigoPadre: '41' },
    { codigo: '42', nombre: 'No operacionales', tipo: 'INGRESO', naturaleza: 'CREDITO', nivel: 2, acepta_movimientos: false, codigoPadre: '4' },
    { codigo: '4210', nombre: 'Financieros', tipo: 'INGRESO', naturaleza: 'CREDITO', nivel: 3, acepta_movimientos: true, codigoPadre: '42' },

    // GASTOS
    { codigo: '5', nombre: 'GASTOS', tipo: 'GASTO', naturaleza: 'DEBITO', nivel: 1, acepta_movimientos: false },
    { codigo: '51', nombre: 'Operacionales de administración', tipo: 'GASTO', naturaleza: 'DEBITO', nivel: 2, acepta_movimientos: false, codigoPadre: '5' },
    { codigo: '5105', nombre: 'Gastos de personal', tipo: 'GASTO', naturaleza: 'DEBITO', nivel: 3, acepta_movimientos: true, codigoPadre: '51' },
    { codigo: '5110', nombre: 'Honorarios', tipo: 'GASTO', naturaleza: 'DEBITO', nivel: 3, acepta_movimientos: true, codigoPadre: '51' },
    { codigo: '5115', nombre: 'Impuestos', tipo: 'GASTO', naturaleza: 'DEBITO', nivel: 3, acepta_movimientos: true, codigoPadre: '51' },
    { codigo: '5120', nombre: 'Arrendamientos', tipo: 'GASTO', naturaleza: 'DEBITO', nivel: 3, acepta_movimientos: true, codigoPadre: '51' },
    { codigo: '5135', nombre: 'Servicios públicos', tipo: 'GASTO', naturaleza: 'DEBITO', nivel: 3, acepta_movimientos: true, codigoPadre: '51' },
    { codigo: '5140', nombre: 'Gastos de viaje', tipo: 'GASTO', naturaleza: 'DEBITO', nivel: 3, acepta_movimientos: true, codigoPadre: '51' },
    { codigo: '5195', nombre: 'Diversos', tipo: 'GASTO', naturaleza: 'DEBITO', nivel: 3, acepta_movimientos: true, codigoPadre: '51' },
    { codigo: '52', nombre: 'No operacionales', tipo: 'GASTO', naturaleza: 'DEBITO', nivel: 2, acepta_movimientos: false, codigoPadre: '5' },
    { codigo: '5210', nombre: 'Financieros', tipo: 'GASTO', naturaleza: 'DEBITO', nivel: 3, acepta_movimientos: true, codigoPadre: '52' },

    // COSTOS
    { codigo: '6', nombre: 'COSTOS', tipo: 'COSTO', naturaleza: 'DEBITO', nivel: 1, acepta_movimientos: false },
    { codigo: '61', nombre: 'Costo de ventas', tipo: 'COSTO', naturaleza: 'DEBITO', nivel: 2, acepta_movimientos: false, codigoPadre: '6' },
    { codigo: '6135', nombre: 'Comercio al por mayor y menor', tipo: 'COSTO', naturaleza: 'DEBITO', nivel: 3, acepta_movimientos: true, codigoPadre: '61' },
  ];

  // Crear primero las cuentas raíz, luego las hijas (por nivel)
  const cuentasPorCodigo: Record<string, string> = {};

  for (let nivel = 1; nivel <= 4; nivel++) {
    const cuentasNivel = planCuentas.filter((c) => c.nivel === nivel);

    for (const cuenta of cuentasNivel) {
      const existing = await prisma.cuentaContable.findUnique({ where: { codigo: cuenta.codigo } });
      if (!existing) {
        const cuentaPadreId = cuenta.codigoPadre ? cuentasPorCodigo[cuenta.codigoPadre] : undefined;

        const creada = await prisma.cuentaContable.create({
          data: {
            codigo: cuenta.codigo,
            nombre: cuenta.nombre,
            tipo: cuenta.tipo,
            naturaleza: cuenta.naturaleza,
            nivel: cuenta.nivel,
            acepta_movimientos: cuenta.acepta_movimientos,
            ...(cuentaPadreId && { cuentaPadreId }),
          },
        });
        cuentasPorCodigo[cuenta.codigo] = creada.id;
      } else {
        cuentasPorCodigo[cuenta.codigo] = existing.id;
      }
    }
  }

  console.log(`✅ ${planCuentas.length} cuentas del PUC creadas`);

  // ─── 5. IMPUESTOS ──────────────────────────────────────────────────────────
  const impuestos = [
    { nombre: 'IVA 19%', codigo: 'IVA19', tipo: 'IVA' as TipoImpuesto, tarifa: 19.00, descripcion: 'IVA general' },
    { nombre: 'IVA 5%', codigo: 'IVA5', tipo: 'IVA' as TipoImpuesto, tarifa: 5.00, descripcion: 'IVA reducido' },
    { nombre: 'ReteIVA 15%', codigo: 'REIVA15', tipo: 'RETE_IVA' as TipoImpuesto, tarifa: 15.00, descripcion: 'Retención de IVA' },
    { nombre: 'ReteRenta 3.5%', codigo: 'RERET35', tipo: 'RETE_RENTA' as TipoImpuesto, tarifa: 3.50, descripcion: 'Retención en la fuente compras' },
    { nombre: 'ReteRenta 10%', codigo: 'RERET10', tipo: 'RETE_RENTA' as TipoImpuesto, tarifa: 10.00, descripcion: 'Retención en la fuente honorarios' },
    { nombre: 'ReteICA 0.414%', codigo: 'REICA', tipo: 'RETE_ICA' as TipoImpuesto, tarifa: 0.414, descripcion: 'Retención de ICA' },
  ];

  for (const imp of impuestos) {
    await prisma.impuesto.upsert({
      where: { codigo: imp.codigo },
      update: {},
      create: imp,
    });
  }
  console.log(`✅ ${impuestos.length} impuestos creados`);

  // ─── 6. PERÍODO CONTABLE INICIAL ───────────────────────────────────────────
  const hoy = new Date();
  const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                 'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

  await prisma.periodoContable.upsert({
    where: { año_mes: { año: hoy.getFullYear(), mes: hoy.getMonth() + 1 } },
    update: {},
    create: {
      año: hoy.getFullYear(),
      mes: hoy.getMonth() + 1,
      nombre: `${MESES[hoy.getMonth()]} ${hoy.getFullYear()}`,
    },
  });
  console.log(`✅ Período contable creado: ${MESES[hoy.getMonth()]} ${hoy.getFullYear()}`);

  // ─── 7. PARÁMETROS DEL SISTEMA ─────────────────────────────────────────────
  const parametros = [
    { clave: 'EMPRESA_NOMBRE', valor: 'CARTAS AL CIELO', descripcion: 'Nombre de la empresa' },
    { clave: 'EMPRESA_NIT', valor: '900.123.456-7', descripcion: 'NIT de la empresa' },
    { clave: 'EMPRESA_CIUDAD', valor: 'Bogotá, Colombia', descripcion: 'Ciudad de la empresa' },
    { clave: 'MONEDA_BASE', valor: 'COP', descripcion: 'Moneda funcional' },
    { clave: 'DECIMALES_CONTABLES', valor: '2', tipo: 'NUMBER', descripcion: 'Decimales en valores contables' },
  ];

  for (const param of parametros) {
    await prisma.parametro.upsert({
      where: { clave: param.clave },
      update: {},
      create: param,
    });
  }
  console.log(`✅ ${parametros.length} parámetros del sistema configurados`);

  console.log('\n🎉 Seed completado exitosamente!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🌐 API: http://localhost:3000/api/v1');
  console.log('💊 Health: http://localhost:3000/health');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
