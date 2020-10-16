import Knex from 'knex';

export async function up (knex:Knex){
    return knex.schema.createTable('favorites', table =>{
        table.increments('id').primary();
        table.string('userIdLogged').notNullable();
        table.string('userIdFavorited').notNullable();       
    })
}

export async function down (knex:Knex){
    return knex.schema.dropTable('favorites')
}