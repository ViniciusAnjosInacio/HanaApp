namespace app.interactions;

using { Country } from '@sap/cds/common';
type BusinessKey : String(10);
type SDate : DateTime;
type LText : String(1024);


entity Interactions_Header {
  key ID : Integer;
  ITEMS  : Composition of many Interactions_Items on ITEMS.INTHeader = $self;
  PARTNER  : BusinessKey;
  LOG_DATE  : SDate;
  BPCOUNTRY : Country;

};
entity Interactions_Items {

    key INTHeader : association to Interactions_Header;
    key TEXT_ID : BusinessKey;
        LANGU   : String(2);
        LOGTEXT : LText;
};

entity Funcionario {
  key ID    : Integer;
  Nome      : String(100);
  Sobrenome : String(100);
  Estado    : String(2);
  Pais      : Country;
  Genero    : String(10);
  Email     : String(50);
  Cargo     : String(50);
};

entity Endereco {
  key ID: Integer;
  Rua: String(100);
  Cidade: String(100);
  CEP: String(10);
  Funcionario_ID: Integer;
  Funcionario: Association to Funcionario on Funcionario_ID = ID;
};



