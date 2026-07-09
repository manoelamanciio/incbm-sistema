package com.manoel.incbm;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;

@Entity
public class Membro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;
    private String cargo;
    private String cpf;
    private Integer dia;
    private Integer mes;

    public Membro() {
    }

    public Membro(String nome, String cargo, Integer dia, Integer mes) {
        this.nome = nome;
        this.cargo = cargo;
        this.dia = dia;
        this.mes = mes;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public String getCargo() {
        return cargo;
    }

    public Integer getDia() {
        return dia;
    }

    public Integer getMes() {
        return mes;
    }
}