using app.interactions from '../db/interactions';
service CatalogService {

 entity Interactions_Header
    as projection on interactions.Interactions_Header;

 entity Interactions_Items
    as projection on  interactions.Interactions_Items;

entity Funcionario
 as projection on interactions.Funcionario;

 entity Endereco
 as projection on interactions.Endereco;

}